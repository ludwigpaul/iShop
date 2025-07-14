// routes/paymentRoutes.js
import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/create-payment-intent', createPaymentIntent);

export default router;