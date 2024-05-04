import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct
} from '../controllers/productController';
import isAuth from '../middleware/is-auth';

const router = express.Router();

router.get('/products', isAuth, getProducts);

router.get('/product/:productId', getProduct);

router.post('/product/create',isAuth, createProduct);

router.put('/update/:productId',isAuth, updateProduct);

router.delete('/delete/:productId',isAuth, deleteProduct);

export default router;
