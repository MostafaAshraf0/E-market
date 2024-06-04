import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
    searchProduct,
} from '../controllers/productController';
import isAuth from '../middleware/is-auth';

const router = express.Router();

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.post('/product/create',isAuth, createProduct);

router.put('/update/:productId',isAuth, updateProduct);

router.delete('/delete/:productId',isAuth, deleteProduct);

router.get('/search', searchProduct);

export default router;
