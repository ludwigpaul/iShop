import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

import logger from "./logger/logger.js";
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors());

const logRequest = (req, res, next) => {
    logger.info(`${req.method} - ${req.url} = ${new Date().toISOString()}`);
    next();
};

app.use(express.json()); // This middleware parses JSON request bodies
app.use(express.text()); // This middleware parses text request bodies
app.use(express.urlencoded({ extended: true })); // This middleware parses URL-encoded request bodies
app.use(morgan('dev')); // Use morgan for logging HTTP requests
app.use(logRequest); // Custom logging middleware

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);

app.get('/', (req, res) => {
   logger.info('Root route');
   res.status(200).send('Welcome to the iShop API!');
});

const PORT = process.env.PORT || 3001;
const APP_NAME = process.env.APP_NAME;
app.listen(PORT, () => logger.info(`${APP_NAME} Server is running on port ${PORT}`));