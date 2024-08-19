import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrder extends Document {
    userId: Types.ObjectId;
    items: {
        productId: Types.ObjectId;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    createdAt: Date;
}

const orderSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IOrder>('Order', orderSchema);
