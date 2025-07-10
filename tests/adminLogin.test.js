import request from 'supertest';
import app from '../app'; // Adjust the path to your Express app

describe('POST /api/v1/admin/login', () => {
    it('should return a token for valid admin credentials', async () => {
        const response = await request(app)
            .post('/api/v1/admin/login')
            .send({ username: 'admin', password: 'adminpassword' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
        const response = await request(app)
            .post('/api/v1/admin/login')
            .send({ username: 'admin', password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid credentials or not an admin');
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app)
            .post('/api/v1/admin/login')
            .send({ username: 'admin' }); // Missing password

        expect(response.status).toBe(400);
    });
});