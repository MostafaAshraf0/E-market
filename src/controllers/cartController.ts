import { Request, Response } from 'express';
import Order from '../models/order';
import mongoose from 'mongoose';
import User from '../models/user';
import Cart from '../models/cart';
import Product from '../models/product';

export const updateCartItemQuantity = async (req: Request, res: Response) => {
    const { userId, productId, action } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid user ID or product ID' });
    }

    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        if (action === 'increase') {
            cart.items[itemIndex].quantity += 1;
        } else if (action === 'decrease') {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                cart.items.splice(itemIndex, 1);
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart item quantity' });
    }
};

export const addItemToCart = async (req: Request, res: Response) => {
    const { userId, productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            const newCart = new Cart({
                userId,
                items: [{ productId, quantity }]
            });
            cart = await newCart.save();
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
};


export const getCart = async (req: Request, res: Response) => {
    const { userId } = req.params;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching cart data' });
    }
};