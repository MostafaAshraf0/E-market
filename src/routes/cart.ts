import express from 'express';
import { addItemToCart, getCart, updateCartItemQuantity } from '../controllers/cartController';

const router = express.Router();

router.post('/add', addItemToCart);
router.get('/:userId', getCart);
router.post('/update-quantity', updateCartItemQuantity);

export default router;
