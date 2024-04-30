import express from 'express';
import { body } from 'express-validator';
import { signup } from '../controllers/userController';

const router = express.Router();

router.post('/signup', signup);

export default router;
