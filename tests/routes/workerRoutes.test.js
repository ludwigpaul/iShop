import request from 'supertest';
import express from 'express';
import workerRoutes from '../../routes/workerRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next()
}));
jest.mock('../../controllers/workerController.js', () => ({
    getWorkerOrders: (req, res) => res.json([{ orderId: 1, status: 'PENDING' }]),
    completeWorkerOrder: (req, res) => res.json({ completed: true })
}));

const app = express();
app.use(express.json());
app.use('/worker', workerRoutes);

describe('Worker Routes', () => {
    it('GET /worker/:workerId/orders should return worker orders', async () => {
        const res = await request(app).get('/worker/1/orders');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('status', 'PENDING');
    });

    it('POST /worker/:workerId/orders/:orderId/complete should complete worker order', async () => {
        const res = await request(app)
            .post('/worker/1/orders/1/complete')
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('completed', true);
    });
});