import {describe, it, expect, jest, beforeEach} from '@jest/globals';
import JWTProvider from "../../security/JWTProvider.js";
import jwt from "jsonwebtoken";

const user = {
    id: 1,
    email: 'test.user@test.com',
    role: 'USER'
}

const admin = {
    id: 2,
    email: 'test.admin.user@test.com',
    role: 'ADMIN'
}

// Mock the logger to avoid actual logging during tests
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe('generateJWT()', () => {

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.JWT_EXPIRATION = '1d';
    });

    it('should generate jwt for valid user', () => {
       const token = JWTProvider.generateJWT(user);
       expect(token).not.toBeNull();

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded).toHaveProperty('id', user.id);
        expect(decoded).toHaveProperty('role', user.role.toLowerCase());

    });

    it('should throw error when user object is missing', () => {
        expect(() => {
            JWTProvider.generateJWT(null);
        }).toThrow('User object with id, role and email is required to generate JWT');
    });


    it('should throw error for missing user id', () => {
        const user = {
            email: 'test.user@test.com',
            role: 'USER'
        }
        expect(() => {
            JWTProvider.generateJWT(user);
        }).toThrow('User object with id, role and email is required to generate JWT');
    });

    it('should throw error for missing user email', () => {
        const user = {
            id: 3,
            role: 'USER'
        }
        expect(() => {
            JWTProvider.generateJWT(user);
        }).toThrow('User object with id, role and email is required to generate JWT');
    });

    it('should throw error for missing user role', () => {
        const user = {
            id: 3,
            email: 'test.user@test.com',
        }
        expect(() => {
            JWTProvider.generateJWT(user);
        }).toThrow('User object with id, role and email is required to generate JWT');
    });

});


describe('generateJWTForAdmin()', () => {
    beforeEach(() => {
        process.env.JWT_SECRET = 'test-jwt-secret';
        process.env.JWT_ADMIN_EXPIRATION = '1h';
    });

    it('should generate jwt for valid admin', () => {
        const token = JWTProvider.generateJWTForAdmin(admin);
        expect(token).not.toBeNull();

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded).toHaveProperty('id', admin.id);
        expect(decoded).toHaveProperty('role', admin.role.toLowerCase());

    });

    it('should throw error when user object is missing', () => {
        expect(() => {
            JWTProvider.generateJWTForAdmin(null);
        }).toThrow('User object with id, role and email is required to generate JWT for admin');
    });


    it('should throw error for missing admin id', () => {
        const admin = {
            email: 'test.user@test.com',
            role: 'ADMIN'
        }
        expect(() => {
            JWTProvider.generateJWTForAdmin(admin);
        }).toThrow('User object with id, role and email is required to generate JWT for admin');
    });

    it('should throw error for missing admin email', () => {
        const admin = {
            id: 3,
            role: 'ADMIN'
        }
        expect(() => {
            JWTProvider.generateJWTForAdmin(admin);
        }).toThrow('User object with id, role and email is required to generate JWT for admin');
    });

    it('should throw error for missing admin role', () => {
        const admin = {
            id: 3,
            email: 'test.user@test.com',
        }
        expect(() => {
            JWTProvider.generateJWTForAdmin(admin);
        }).toThrow('User object with id, role and email is required to generate JWT for admin');
    });
});

describe('verifyJWT', () => {

    process.env.JWT_SECRET = 'test-jwt';

    it('should verify that token is valid for user role', () => {

        const token = JWTProvider.generateJWT(user);

        const decoded = JWTProvider.verifyJWT(token);
        expect(decoded).toHaveProperty('id', user.id);
        expect(decoded).toHaveProperty('role', user.role.toLowerCase());

    });

    it('should verify that token is valid for admin role', () => {

        const token = JWTProvider.generateJWTForAdmin(admin);

        const decoded = JWTProvider.verifyJWT(token);
        expect(decoded).toHaveProperty('id', admin.id);
        expect(decoded).toHaveProperty('role', admin.role.toLowerCase());

    });

    it('should throw exception for missing or empty token', () => {
        expect(() => {
            JWTProvider.verifyJWT(null);
        }).toThrow('Token is required for verification');
    });

    it('should throw invalid token for test-token', () => {
        expect(() => {
            JWTProvider.verifyJWT('test-token');
        }).toThrow('Invalid or expired token');
    });

    it('should throw expired token for user expired token', () => {

        process.env.JWT_EXPIRATION='0s';
        const token = JWTProvider.generateJWT(user);

        setTimeout(()=> {
            expect(() => {
                JWTProvider.verifyJWT(token);
            }).toThrow('Invalid or expired token');
        }, 1000)

    });

    it('should throw expired token for admin expired token', () => {

        process.env.JWT_ADMIN_EXPIRATION='0s';
        const token = JWTProvider.generateJWTForAdmin(admin);

        setTimeout(()=> {
            expect(() => {
                JWTProvider.verifyJWT(token);
            }).toThrow('Invalid or expired token');
        }, 1000)

    });

});