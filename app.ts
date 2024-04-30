import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import userRoutes from './routes/user';
import productRoutes from './routes/product';

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: any) => {
        cb(null, 'images');
    },
    filename: (req: Request, file: Express.Multer.File, cb: any) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json());
app.use(multer({storage: fileStorage,fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, '/images')));

app.use('/user', userRoutes);
app.use(productRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message: message});
});

const MONGODB_URI = 'mongodb+srv://mostafaashraf334:WYcZ6tE22UmPdt55@cluster0.s8regf6.mongodb.net/market?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
.then(result => {
    console.log('mongo')
    app.listen(8080);
})
.catch(err => console.log(err));
