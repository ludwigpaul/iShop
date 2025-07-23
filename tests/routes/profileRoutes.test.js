import request from 'supertest';
import express from 'express';
import profileRoutes from '../../routes/profileRoutes.js';

// Mock middleware and controller
jest.mock('../../middleware/authMiddleware.js', () => ({
    verifyToken: (req, res, next) => next()
}));
jest.mock('../../controllers/profileController.js', () => ({
    getUserProfile: (req, res) => res.json({ id: 1, username: 'testuser' }),
    updateUserProfile: (req, res) => res.json({ success: true })
}));

const app = express();
app.use(express.json());
app.use('/profile', profileRoutes);

describe('Profile Routes', () => {
    it('GET /profile should return user profile', async () => {
        const res = await request(app).get('/profile');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('username', 'testuser');
    });

    it('PUT /profile should update user profile', async () => {
        const res = await request(app)
            .put('/profile')
            .send({ username: 'updateduser' });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });
});