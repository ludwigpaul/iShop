import request from 'supertest';
import express from 'express';
import orderRoutes from '../../routes/orderRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: (role) => (req, res, next) => next()
}));
jest.mock('../../controllers/orderController.js', () => ({
    getAllOrders: (req, res) => res.json([{ id: 1, status: 'PENDING' }]),
    getOrderById: (req, res) => res.json({ id: 1, status: 'PENDING' }),
    createOrder: (req, res) => res.status(201).json({ id: 2, status: 'CREATED' }),
    updateOrder: (req, res) => res.json({ success: true }),
    deleteOrder: (req, res) => res.json({ deleted: true }),
    completeOrder: (req, res) => res.json({ completed: true })
}));

const app = express();
app.use(express.json());
app.use('/order', orderRoutes);

describe('Order Routes', () => {
    it('GET /order/ should return all orders', async () => {
        const res = await request(app).get('/order/');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('status', 'PENDING');
    });

    it('GET /order/id/:id should return order by id', async () => {
        const res = await request(app).get('/order/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('GET /order/user/:userId should create order (unusual GET)', async () => {
        const res = await request(app).get('/order/user/1');
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 2);
    });

    it('POST /order/checkout should create order', async () => {
        const res = await request(app)
            .post('/order/checkout')
            .send({ items: [1, 2] });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('status', 'CREATED');
    });

    it('POST /order/complete/:orderId should complete order', async () => {
        const res = await request(app)
            .post('/order/complete/1')
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('completed', true);
    });

    it('PUT /order/id/:id should update order', async () => {
        const res = await request(app)
            .put('/order/id/1')
            .send({ status: 'UPDATED' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('DELETE /order/id/:id should delete order', async () => {
        const res = await request(app).delete('/order/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('deleted', true);
    });
});