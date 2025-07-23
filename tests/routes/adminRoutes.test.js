import request from 'supertest';
import express from 'express';
import adminRoutes from '../../routes/adminRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next()
}));
jest.mock('../../controllers/adminController.js', () => ({
    loginAdmin: (req, res) => res.json({ token: 'test-token' }),
    assignOrder: (req, res) => res.json({ success: true }),
    getWorkers: (req, res) => res.json([{ id: 1, name: 'Worker' }]),
    getWorkerOrders: (req, res) => res.json([{ id: 1, status: 'ASSIGNED' }]),
    getAllUsers: (req, res) => res.json([{ id: 1, name: 'User' }]),
    getAllOrders: (req, res) => res.json([{ id: 1, status: 'PENDING' }])
}));

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

describe('Admin Routes', () => {
    it('POST /admin/login should return token', async () => {
        const res = await request(app).post('/admin/login').send({ username: 'admin', password: 'pass' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token', 'test-token');
    });

    it('GET /admin/users should return users', async () => {
        const res = await request(app).get('/admin/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /admin/orders should return orders', async () => {
        const res = await request(app).get('/admin/orders');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /admin/assign-order should assign order', async () => {
        const res = await request(app).post('/admin/assign-order').send({ orderId: 1, workerId: 2 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('GET /admin/workers should return workers', async () => {
        const res = await request(app).get('/admin/workers');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /admin/worker/1/orders should return worker orders', async () => {
        const res = await request(app).get('/admin/worker/1/orders');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});