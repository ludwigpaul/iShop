import request from 'supertest';
import app from '../app.js'; // Import the Express app
import { db } from '../config/dbConfig.js'; // Mock the database

jest.mock('../config/dbConfig.js', () => ({
    db: { query: jest.fn() }
})); // Mock the database connection

describe('Login Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 200 and a token for valid credentials', async () => {
        db.query.mockResolvedValueOnce([[{ username: 'admin', password: 'hashedpassword' }]]); // Mock DB response
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'admin', password: 'adminpassword' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
        db.query.mockResolvedValueOnce([[]]); // Mock no user found
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'admin', password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 500 for server errors', async () => {
        db.query.mockRejectedValueOnce(new Error('Database error')); // Mock DB error
        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ username: 'admin', password: 'adminpassword' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toHaveProperty('error', 'Internal server error');
    });
});