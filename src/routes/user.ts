import express from 'express';
import { body } from 'express-validator';
import { signup , login } from '../controllers/userController';
import User from '../models/user';

const router = express.Router();

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please Enter A valid email address')
    .custom((value, {req}) => {
        return User.findOne({ email: value })
        .then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail address already exists');
            }
        });
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({min: 5}),
    body('name')
    .trim()
    .isLength({min: 3})
    .not()
    .isEmpty(),

], signup);

router.post('/login', login);

export default router;
