import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    status: string;
    products: Types.ObjectId[];
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am new!'
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }]
});

export default mongoose.model<IUser>('User', userSchema);
