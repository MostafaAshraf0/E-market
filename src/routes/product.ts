import express from 'express';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
    searchProduct,
} from '../controllers/productController';
import { authMiddleware, authorize } from '../middleware/is-auth';

const router = express.Router();

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.post('/product/create',authMiddleware,authorize(['admin']), createProduct);

router.put('/update/:productId',authMiddleware, updateProduct);

router.delete('/delete/:productId',authMiddleware, deleteProduct);

router.get('/search', searchProduct);

export default router;
