import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Product, { ProductDocument } from '../models/product';
import fs from 'fs';
import path from 'path';

export const getProducts = (req: Request, res: Response, next: NextFunction): void => {
    const currentPage: number = req.query.page ? +req.query.page : 1  ;
    const perPage: number = 2;
    let totalitems: number ;
    Product.find()
    .countDocuments()
    .then(count => {
        totalitems = count;
        return Product.find()
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

export const createProduct = (req: Request, res: Response, next: NextFunction): void => {
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
    const imageUrl = req.file.path;
    const { title, description } = req.body;
    const product = new Product({
        imageUrl,
        title,
        description,
        creator: { name: 'Max' }
    });
    product
        .save()
        .then((result: ProductDocument) => {
            res.status(201).json({
                message: 'Product Created successfully',
                product: result
            });
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

export const updateProduct = (req: Request, res: Response, next: NextFunction): void => {
    const productId = req.params.productId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        (error as any).statusCode = 422;
        throw error;
    }
    const { title, description } = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No File Picked');
        (error as any).statusCode = 422;
        throw error;
    }
    Product.findById(productId)
        .then((product: ProductDocument | null) => {
            if (!product) {
                const error = new Error('Could not find Product.');
                (error as any).statusCode = 404;
                throw error;
            }

            if (imageUrl !== product.imageUrl) {
                clearImage(product.imageUrl);
            }

            product.imageUrl = imageUrl;
            product.title = title;
            product.description = description;
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
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err: NodeJS.ErrnoException | null) => console.log(err));
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction): void => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then((product: ProductDocument | null) => {
            if (!product) {
                const error = new Error('Could not find Product.');
                (error as any).statusCode = 404;
                throw error;
            }
            clearImage(product.imageUrl);
            return Product.findByIdAndDelete(productId);
        })
        .then((result: ProductDocument | null) => {
            console.log(result);
            res.status(200).json({ message: 'Product Deleted' });
        })
        .catch((err: any) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


