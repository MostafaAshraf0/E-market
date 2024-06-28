import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User, { IUser }  from '../models/user';
import jwt from 'jsonwebtoken';
interface AuthRequest extends Request {
    userId?: string;
    role?: 'user' | 'editor' | 'admin';
    userRole?: string;
}

export const getUserList = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const users = await User.find({}, 'email name role');
        res.status(200).json({users});
    } catch (error){
        console.error('Error fetching user list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const editUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        (error as any).statusCode = 422;
        (error as any).data = errors.array();
        throw error;
    }

    const { email, name, password, role } = req.body;

    try {
        // if (req.userId !== userId) {
        //     const error = new Error('Not authorized.');
        //     (error as any).statusCode = 403;
        //     throw error;
        // }

        if (req.userId !== userId && req.role !== 'admin') {
            const error = new Error('Not authorized.');
            (error as any).statusCode = 403;
            throw error;
        }

        const user: IUser | null = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            (error as any).statusCode = 404;
            throw error;
        }

        user.email = email || user.email;
        user.name = name || user.name;

        if (password) {
            user.password = await bcrypt.hash(password, 12);
        }

        // if (role) {
        //     user.role = role;
        // }

        if (role && req.role === 'admin') {
            user.role = role as 'user' | 'editor' | 'admin';
        }

        const updatedUser = await user.save();
        res.status(200).json({ message: 'User updated!', user: updatedUser });
    } catch (err: any) {
        console.error('Error updating user:', err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

export const signup = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        (error as any).statusCode = 422;
        (error as any).data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const role = req.body.role || 'user';

    bcrypt.hash(password, 12)
    .then(hashedPw => {
        const user = new User({
            email: email,
            name: name,
            password: hashedPw,
            role: role,
        });
        return user.save();
    })
    .then(result => {
        res.status(201).json({message: 'User Created!', userId: result._id})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

export const login = (req: Request, res: Response, next: NextFunction): void => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser: IUser;
    User.findOne({ email: email})
    .then((user)=> {
        if(!user){
        const error = new Error('A user with this email could not be found');
        (error as any).statusCode = 401;
        throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
        if(!isEqual){
            const error = new Error('Wrong Password');
            (error as any).statusCode = 401;
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
            role: loadedUser.role,
        },
        'somesupersecretsecret',
        {expiresIn: '1h'}
    );
    res.status(200).json({token: token, userId: loadedUser._id.toString()});
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

export const userSearch = async (req: Request, res: Response, next: NextFunction) => {
    const { keyword } = req.query;

    try {
        const users: IUser[] = await User.find({
            $or: [
                { email: { $regex: keyword,} },
                { name: { $regex: keyword,} }
            ]
        }).select('email name role');

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};