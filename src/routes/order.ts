import express from 'express';
import { createOrder, getOrderByUserId} from '../controllers/orderController';

const router = express.Router();

router.post('/create', createOrder);
router.get('/:userId', getOrderByUserId);


export default router;