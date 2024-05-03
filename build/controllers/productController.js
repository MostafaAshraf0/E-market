"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
var express_validator_1 = require("express-validator");
var product_1 = __importDefault(require("../models/product"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var getProducts = function (req, res, next) {
    product_1.default.find()
        .then(function (products) {
        res.status(200).json({ message: 'Fetched Products successfully', products: products });
    })
        .catch(function (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.getProducts = getProducts;
var getProduct = function (req, res, next) {
    var productId = req.params.productId;
    product_1.default.findById(productId)
        .then(function (product) {
        if (!product) {
            var error = new Error('Could not find Product.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Product Fetched.', product: product });
    })
        .catch(function (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.getProduct = getProduct;
var createProduct = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        var error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        var error = new Error('No Image provided');
        error.statusCode = 422;
        throw error;
    }
    var imageUrl = req.file.path;
    var _a = req.body, title = _a.title, description = _a.description;
    var product = new product_1.default({
        imageUrl: imageUrl,
        title: title,
        description: description,
        creator: { name: 'Max' }
    });
    product
        .save()
        .then(function (result) {
        res.status(201).json({
            message: 'Product Created successfully',
            product: result
        });
    })
        .catch(function (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.createProduct = createProduct;
var updateProduct = function (req, res, next) {
    var productId = req.params.productId;
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        var error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    var _a = req.body, title = _a.title, description = _a.description;
    var imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        var error = new Error('No File Picked');
        error.statusCode = 422;
        throw error;
    }
    product_1.default.findById(productId)
        .then(function (product) {
        if (!product) {
            var error = new Error('Could not find Product.');
            error.statusCode = 404;
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
        .then(function (result) {
        res.status(200).json({ message: 'Product Updated', product: result });
    })
        .catch(function (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.updateProduct = updateProduct;
var clearImage = function (filePath) {
    filePath = path_1.default.join(__dirname, '..', filePath);
    fs_1.default.unlink(filePath, function (err) { return console.log(err); });
};
var deleteProduct = function (req, res, next) {
    var productId = req.params.productId;
    product_1.default.findById(productId)
        .then(function (product) {
        if (!product) {
            var error = new Error('Could not find Product.');
            error.statusCode = 404;
            throw error;
        }
        clearImage(product.imageUrl);
        return product_1.default.findByIdAndDelete(productId);
    })
        .then(function (result) {
        console.log(result);
        res.status(200).json({ message: 'Product Deleted' });
    })
        .catch(function (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.deleteProduct = deleteProduct;
