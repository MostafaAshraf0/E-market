
import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    productId: Schema.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    userId: Schema.Types.ObjectId;
    items: ICartItem[];
}

const cartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }]
});

export default mongoose.model<ICart>('Cart', cartSchema);
