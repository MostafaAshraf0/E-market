import jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    userId?: string;
    role?: 'user' | 'editor' | 'admin';
}
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void =>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Authorization header not found');
        (error as any).statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecret') as { userId: string , role: any };
    } catch (err) {
        (err as any).statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated');
        (error as any).statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    next();
};

export const authorize = (roles: Array<'user' | 'editor' | 'admin'>) =>{
    return (req: AuthRequest, res: Response, next: NextFunction) =>{
        if(!roles.includes(req.role as 'user' | 'editor' | 'admin')) {
            const error = new Error('Not Authorized.');
            (error as any).statusCode = 403;
            throw error;
        }
        next();
    };
};