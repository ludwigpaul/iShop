// tests/routes/productRoutes.test.js
import request from 'supertest';
import express from 'express';
import productRoutes from '../../routes/productRoutes.js';

// Mock middleware and controller
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next()
}));
jest.mock('../../controllers/productController.js', () => ({
    getAllProducts: (req, res) => res.json([{ id: 1, name: 'Laptop' }]),
    getProductById: (req, res) => res.json({ id: 1, name: 'Laptop' }),
    findProducts: (req, res) => res.json([{ id: 1, name: 'Laptop' }]),
    createProduct: (req, res) => res.status(201).json({ id: 2, name: 'Phone' }),
    updateProduct: (req, res) => res.json({ success: true }),
    deleteProduct: (req, res) => res.json({ deleted: true })
}));

const app = express();
app.use(express.json());
app.use('/product', productRoutes);

describe('Product Routes', () => {
    it('GET /product/ should return all products', async () => {
        const res = await request(app).get('/product/');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('name', 'Laptop');
    });

    it('GET /product/id/:id should return product by id', async () => {
        const res = await request(app).get('/product/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('GET /product/search should find products', async () => {
        const res = await request(app).get('/product/search');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /product/ should create a product', async () => {
        const res = await request(app)
            .post('/product/')
            .send({ name: 'Phone' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'Phone');
    });

    it('PUT /product/id/:id should update a product', async () => {
        const res = await request(app)
            .put('/product/id/1')
            .send({ name: 'Updated' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('DELETE /product/id/:id should delete a product', async () => {
        const res = await request(app).delete('/product/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('deleted', true);
    });
});