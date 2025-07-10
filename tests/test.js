// tests/test.js
import request from 'supertest';
import app from '../app.js'; // adjust the path as needed

describe('Admin Login', () => {
    it('should return a token for valid credentials', async () => {
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'admin', password: 'adminpassword' });

        expect(res.statusCode).toBe(200);
    });

    it('should return 401 for invalid credentials', async () => {
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'admin', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
    });
});