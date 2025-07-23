import request from 'supertest';
import express from 'express';
import categoryRoutes from '../../routes/categoryRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next()
}));
jest.mock('../../controllers/categoryController.js', () => ({
    getAllCategories: (req, res) => res.json([{ id: 1, name: 'Electronics' }]),
    getCategoryById: (req, res) => res.json({ id: 1, name: 'Electronics' }),
    createCategory: (req, res) => res.status(201).json({ id: 2, name: 'Books' }),
    updateCategory: (req, res) => res.json({ success: true }),
    deleteCategory: (req, res) => res.json({ deleted: true }),
    findCategories: (req, res) => res.json([{ id: 1, name: 'Electronics' }])
}));

const app = express();
app.use(express.json());
app.use('/category', categoryRoutes);

describe('Category Routes', () => {
    it('GET /category/ should return all categories', async () => {
        const res = await request(app).get('/category/');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('name', 'Electronics');
    });

    it('GET /category/id/:id should return category by id', async () => {
        const res = await request(app).get('/category/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('POST /category/ should create a category', async () => {
        const res = await request(app)
            .post('/category/')
            .send({ name: 'Books' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'Books');
    });

    it('PUT /category/id/:id should update a category', async () => {
        const res = await request(app)
            .put('/category/id/1')
            .send({ name: 'Updated' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('DELETE /category/id/:id should delete a category', async () => {
        const res = await request(app).delete('/category/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('deleted', true);
    });

    it('GET /category/search should find categories', async () => {
        const res = await request(app).get('/category/search');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});