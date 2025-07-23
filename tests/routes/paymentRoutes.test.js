import request from 'supertest';
import express from 'express';
import paymentRoutes from '../../routes/paymentRoutes.js';

// Mock middleware and controller
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next()
}));
jest.mock('../../controllers/paymentController.js', () => ({
    createPaymentIntent: (req, res) => res.status(200).json({ clientSecret: 'test_secret' })
}));

const app = express();
app.use(express.json());
app.use('/payment', paymentRoutes);

describe('Payment Routes', () => {
    it('POST /payment/create-payment-intent should create a payment intent', async () => {
        const res = await request(app)
            .post('/payment/create-payment-intent')
            .send({ amount: 1000, currency: 'usd' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('clientSecret', 'test_secret');
    });
});