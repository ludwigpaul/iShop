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
import paymentRouter from './routes/paymentRoutes.js';
import workerRouter from './routes/workerRoutes.js';
import db from './models/index.js';


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
app.use(express.text()); // This middleware parses text request bodies
app.use(express.urlencoded({ extended: true })); // This middleware parses URL-encoded request bodies
app.use(morgan('dev')); // Use morgan for logging HTTP requests
app.use(logRequest); // Custom logging middleware

app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/worker', workerRouter);

app.get('/', (req, res) => {
   logger.info('Root route');
   res.status(200).send('Welcome to the iShop API!');
});

// Add this health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const APP_NAME = process.env.APP_NAME || 'iShop API';

// Sync database and start the server
db.sequelize.sync({force: false})
    .then(() => {
        logger.info(`Database connection is successful!`);
        app.listen(PORT, HOST, () => logger.info(`${APP_NAME} Server is running on ${HOST}:${PORT}`));
        logger.info(`Health check available at http://${HOST}:${PORT}/health`);
    });

export default app;