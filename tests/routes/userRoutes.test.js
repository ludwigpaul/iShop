import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/userRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next(),
    requireRole: () => (req, res, next) => next()
}));
jest.mock('../../controllers/userController.js', () => ({
    getAllUsers: (req, res) => res.json([{ id: 1, email: 'test@example.com' }]),
    getUserByEmail: (req, res) => res.json({ id: 1, email: 'test@example.com' }),
    getUserById: (req, res) => res.json({ id: 1, email: 'test@example.com' }),
    updateUser: (req, res) => res.json({ success: true }),
    deleteUser: (req, res) => res.json({ deleted: true })
}));

const app = express();
app.use(express.json());
app.use('/user', userRoutes);

describe('User Routes', () => {
    it('GET /user/ should return all users', async () => {
        const res = await request(app).get('/user/');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('email', 'test@example.com');
    });

    it('GET /user/email/:email should return user by email', async () => {
        const res = await request(app).get('/user/email/test@example.com');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('GET /user/id/:id should return user by id', async () => {
        const res = await request(app).get('/user/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('PUT /user/id/:id should update user', async () => {
        const res = await request(app)
            .put('/user/id/1')
            .send({ email: 'updated@example.com' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    it('DELETE /user/id/:id should delete user', async () => {
        const res = await request(app).delete('/user/id/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('deleted', true);
    });
});