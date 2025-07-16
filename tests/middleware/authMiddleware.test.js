import {describe, it, expect, jest, beforeEach} from '@jest/globals';
import AuthMiddleware from "../../middleware/authMiddleware.js";
import JWTProvider from "../../security/JWTProvider.js";
import jwt from "jsonwebtoken";


const user = {
    id: 1,
    email: 'test@yahoo.com',
    role: 'admin',
    username: 'test.user'
}

// Mock the logger to avoid actual logging during tests
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn()
}));


describe('verifyToken()', () => {

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {headers: {}};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        mockNext = jest.fn();
        process.env.JWT_SECRET = 'secret';
        process.env.JWT_EXPIRATION = '1h';
    });


    it('should throw 401 for missing authorization header', () => {
        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Authorization header is required'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        mockReq.headers['authorization'] = 'Bearer invalid-token';

        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid or expired token'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
        const validUser = { id: 1, email: 'test@example.com' };
        const token = jwt.sign(validUser, process.env.JWT_SECRET, { expiresIn: '0s' });
        mockReq.headers['authorization'] = `Bearer ${token}`;

        // Wait for token to expire
        setTimeout(() => {
            AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid or expired token'
            });
            expect(mockNext).not.toHaveBeenCalled();
        }, 1000);
    });

    it('should handle malformed (missing bearer) authorization header', () => {
        mockReq.headers['authorization'] = 'Invalid-Format';

        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid or malformed authorization header'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
        mockReq.headers['authorization'] = 'BearerInvalid-Format';

        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid or malformed authorization header'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header with Bearer as suffix', () => {
        mockReq.headers['authorization'] = 'Invalid-Format Bearer';

        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Invalid or malformed authorization header'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });


    it('should call next() and set req.user if token is valid', () => {

        const token = JWTProvider.generateJWT(user);
        mockReq.headers['authorization'] = `Bearer ${token}`;

        AuthMiddleware.verifyToken(mockReq, mockRes, mockNext);
        expect(mockReq.user).toBeDefined();
        expect(mockReq.user.id).toBe(user.id);
        expect(mockReq.user.role).toBe(user.role);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();

    });


});


describe('requireRole()', () => {

    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Reset mocks before each test
        mockReq = {
            user: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });


    it('should call next() if user is Authorized. Has role of ADMIN', () => {
        const role = 'ADMIN';
        mockReq.user = { role: role };
        const middleware = AuthMiddleware.requireRole(role);

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();

    });

    it('should call next() when user role case is different but matches (admin)', () => {
        mockReq.user = { role: 'admin' };
        const middleware = AuthMiddleware.requireRole('ADMIN');

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 403 when user has wrong role', () => {
        mockReq.user = { role: 'USER' };
        const middleware = AuthMiddleware.requireRole('ADMIN');

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Forbidden: You do not have the required permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user object is missing', () => {
        mockReq.user = undefined;
        const middleware = AuthMiddleware.requireRole('ADMIN');

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Forbidden: You do not have the required permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is missing', () => {
        mockReq.user = { name: 'Test User' }; // user object without role
        const middleware = AuthMiddleware.requireRole('ADMIN');

        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: 'Forbidden: You do not have the required permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should work with different role types (USER role)', () => {
        mockReq.user = { role: 'USER' };
        const middleware = AuthMiddleware.requireRole('USER');

        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
    });

});