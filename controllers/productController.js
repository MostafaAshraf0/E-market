const {validationResult} = require('express-validator');
const Product = require('../models/product');
const fs = require('fs');
const path = require('path');

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.status(200).json({message: 'Fetched Products successfully', products: products});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then(product => {
        if(!product){
            const error = new Error('Could not find Product.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'Product Fetched.', product: product});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.createProduct = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file){
        const error = new Error('No Image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const { title, description } = req.body;
    const product = new Product({
        imageUrl: imageUrl,
        title: title,
        description: description,
        creator: {name: 'Max'}
    });
    product
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Product Created successfully',
            product: result
        });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};


exports.updateProduct = (req, res, next) => {
    const productId = req.params.productId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const {title, description} = req.body;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No File Picked');
        error.statusCode = 422;
        throw error;
    }
    Product.findById(productId)
    .then(product => {
        if (!product){
            const error = new Error('Could not find Product.');
            error.statusCode = 404;
            throw error;
        }

        if(imageUrl !== product.imageUrl){
            clearImage(product.imageUrl);
        }

        product.imageUrl = imageUrl;
        product.title = title;
        product.description = description;
        return product.save();
    })
    .then(result => {
        res.status(200).json({message: 'Product Updated', product:result});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err =>  console.log(err));
};

exports.deleteProduct = (req, res,  next) => {
    const productId = req.params.productId;
    Product.findById(productId)
    .then(product => {
        if (!product){
            const error = new Error('Could not find Product.');
            error.statusCode = 404;
            throw error;
        }
        clearImage(product.imageUrl);
        return Product.findByIdAndDelete(productId);
    })
    .then(result =>{
        console.log(result);
        res.status(200).json({message: 'Product Deleted'});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};