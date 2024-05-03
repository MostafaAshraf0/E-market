import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User, { IUser }  from '../models/user';
import jwt from 'jsonwebtoken';

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

    bcrypt.hash(password, 12)
    .then(hashedPw => {
        const user = new User({
            email: email,
            name: name,
            password: hashedPw,
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
            userId: loadedUser._id.toString()
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
