import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Product, { ProductDocument } from '../models/product';
import User from '../models/user';
import fs from 'fs';
import path from 'path';
import product from '../models/product';

interface AuthRequest extends Request {
    userId?: string;
}

export const getProducts = (req: Request, res: Response, next: NextFunction): void => {
    const currentPage: number = req.query.page ? +req.query.page : 1  ;
    const perPage: number = 4;
    let totalitems: number ;
    Product.find()
    .countDocuments()
    .then(count => {
        totalitems = count;
        return Product.find()
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((products: ProductDocument[]) => {
        res.status(200).json({ message: 'Fetched Products successfully', products: products , totalitems: totalitems });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

export const getProduct = (req: Request, res: Response, next: NextFunction): void => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product: ProductDocument | null) => {
            if (!product) {
                const error = new Error('Could not find Product.');
                (error as any).statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Product Fetched.', product });
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

export const createProduct = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        (error as any).statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No Image provided');
        (error as any).statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path.replace(/\\/g, '/');
    console.log({ imageUrl });
    const { title, description, price } = req.body;
    let creator: any;
    const product = new Product({
        imageUrl,
        title,
        description,
        price,
        creator: req.userId
    });
    product
        .save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then((user: any) =>{
            creator = user;
            user.products.push(req.userId);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Product Created successfully',
                product: product,
                creator: {_id: creator._id, name: creator.name}
            });
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

export const updateProduct = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const productId = req.params.productId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        (error as any).statusCode = 422;
        throw error;
    }
    const { title, description, price } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    }
    // if (!imageUrl) {
    //     const error = new Error('No File Picked');
    //     (error as any).statusCode = 422;
    //     throw error;
    // }
    Product.findById(productId)
        .then((product: ProductDocument | null) => {
            if (!product) {
                const error = new Error('Could not find Product.');
                (error as any).statusCode = 404;
                throw error;
            }

            if (!product.creator || product.creator.toString() !== req.userId){
                const error = new Error('Not authorized!');
                (error as any).statusCode = 403;
                throw error;
            }
            
            if (imageUrl !== product.imageUrl) {
                console.log({produrl: product.imageUrl, replaced: product.imageUrl.replace(/\\/g, '/') });
                clearImage(product.imageUrl);
            }
            
            product.imageUrl = imageUrl ? imageUrl.replace(/\\/g, '/') : product.imageUrl;
            product.title = title;
            product.description = description;
            product.price = price;
            return product.save();
        })
        .then((result: ProductDocument) => {
            res.status(200).json({ message: 'Product Updated', product: result });
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

const clearImage = (filePath: string): void => {
    // filePath = path.join(__dirname, '..', '..', 'images', filePath);
    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => console.log(err));
    console.log('wasalta');
};

export const deleteProduct = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product: ProductDocument | null) => {
            if (!product) {
                const error = new Error('Could not find Product.');
                (error as any).statusCode = 404;
                throw error;
            }
            if (!product.creator || product.creator.toString() !== req.userId){
                const error = new Error('Not authorized!');
                (error as any).statusCode = 403;
                throw error;
            }
            clearImage(product.imageUrl);
            return Product.findByIdAndDelete(productId);
        })
        .then((result: ProductDocument | null) => {
            return User.findById(req.userId);
        })
        .then(user => {
            if (!user) {
                throw new Error('User not found');
            }
            if (user.products) {
                user.products.pull(productId);
                return user.save();
            } else {
                throw new Error('User products array not found');
            }
        })
        .then(result => {
            res.status(200).json({ message: 'Product Deleted' });
            console.log('hase wasalta');
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


export const searchProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {keyword} = req.query;
        const products: ProductDocument[] = await Product.find({
            $or: [
                {title: {$regex: keyword}},
                { description: { $regex: keyword} },
            ],
        });
        res.status(200).json({ products });
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};