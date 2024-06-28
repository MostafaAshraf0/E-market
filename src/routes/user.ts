import express from 'express';
import { body } from 'express-validator';
import { signup , login, getUserList, editUser, userSearch } from '../controllers/userController';
import User from '../models/user';
import { authMiddleware, authorize } from '../middleware/is-auth';

const router = express.Router();

router.get('/search', userSearch);

router.get('/list', getUserList);

router.post('/edit/:userId',authMiddleware,authorize(['user', 'editor', 'admin']),
    [
        body('email').optional().isEmail().withMessage('Please enter a valid email.'),
        body('name').optional().trim().isLength({ min: 1 }).withMessage('Name must not be empty.'),
        body('password').optional().trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long.'),
        // body('role').optional().isIn(['user', 'editor', 'admin']).withMessage('Invalid role.')
    ],
    editUser);

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
