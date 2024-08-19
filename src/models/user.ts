import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    status: string;
    products: mongoose.Types.Array<mongoose.Types.ObjectId>;
    role: 'user' | 'editor' | 'admin';
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        // select: false
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
    }],
    role: {
        type: String,
        enum: ['user', 'editor', 'admin'],
        required: true,
        default: 'user'
    },
});

export default mongoose.model<IUser>('User', userSchema);
