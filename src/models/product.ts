import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    imageUrl: string;
    description: string;
    price: number;
    creator?: Types.ObjectId;
}

export type ProductDocument = IProduct & Document;

const productSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
{ timestamps: true }
);

export default mongoose.model<IProduct>('Product', productSchema);
