import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import logger from "./logger/logger.js";
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import userRouter from './routes/userRoutes.js';
import profileRouter from './routes/profileRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import authRouter from './routes/authRoutes.js';
import {loginUser} from "./controllers/userController.js";


dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3002', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


const logRequest = (req, res, next) => {
    logger.info(`${req.method} - ${req.url} = ${new Date().toISOString()}`);
    next();
};

app.use(express.json()); // This middleware parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // This middleware parses URL-encoded request bodies
app.use(morgan('dev')); // Use morgan for logging HTTP requests
app.use(logRequest); // Custom logging middleware

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/login', authRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/', (req, res) => {
   logger.info('Root route');
   res.status(200).send('Welcome to the iShop API!');
});

const PORT = parseInt(process.env.PORT) || 3001;
const APP_NAME = process.env.APP_NAME;
app.listen(PORT, () => logger.info(`${APP_NAME} Server is running on port ${PORT}`));

export default app;