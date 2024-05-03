import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct
} from '../controllers/productController';

const router = express.Router();

router.get('/products', getProducts);

router.get('/product/:productId', getProduct);

router.post('/product/create', createProduct);

router.put('/update/:productId', updateProduct);

router.delete('/delete/:productId', deleteProduct);

export default router;
