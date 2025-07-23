import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes.js';

// Mock middleware and controllers
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next()
}));
jest.mock('../../controllers/authController.js', () => ({
    loginUser: (req, res) => res.json({ token: 'user-token' }),
    loginWorker: (req, res) => res.json({ token: 'worker-token' }),
    registerUser: (req, res) => res.status(201).json({ id: 1 }),
    logoutUser: (req, res) => res.json({ success: true }),
    verifyEmail: (req, res) => res.json({ verified: true })
}));

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    it('GET /auth/verify-email should verify email', async () => {
        const res = await request(app).get('/auth/verify-email');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('verified', true);
    });

    it('POST /auth/login should login user', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@example.com', password: 'secret' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token', 'user-token');
    });

    it('POST /auth/register should register user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'secret', username: 'testuser' });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id', 1);
    });

    it('POST /auth/login/worker should login worker', async () => {
        const res = await request(app)
            .post('/auth/login/worker')
            .send({ email: 'worker@example.com', password: 'secret' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token', 'worker-token');
    });

    it('POST /auth/logout should logout user', async () => {
        const res = await request(app)
            .post('/auth/logout')
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });
});