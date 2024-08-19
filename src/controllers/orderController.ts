// controllers/orderController.ts
import { Request, Response } from 'express';
import Order from '../models/order';
import Cart from '../models/cart';
import Product, { IProduct } from '../models/product';
import mongoose from 'mongoose';

export const createOrder = async (req: Request, res: Response) => {
    const { cartId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        return res.status(400).json({ message: 'Invalid cart ID' });
    }

    try {
        const cart = await Cart.findById(cartId).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const items = cart.items.map(item => {
            const product = item.productId as unknown as IProduct;
            return {
                productId: product._id,
                quantity: item.quantity,
                price: product.price
            };
        });

        const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

        const order = new Order({
            userId: cart.userId,
            items,
            totalPrice
        });

        await order.save();
        await Cart.findByIdAndDelete(cartId);

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

export const getOrderByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid User ID' });
    }

    try {
        const orders = await Order.find({ userId });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching orders' });
    }
};