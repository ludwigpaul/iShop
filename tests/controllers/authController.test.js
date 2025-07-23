import * as authController from '../../controllers/authController.js';
import {beforeAll, jest} from '@jest/globals';
import * as emailServiceModule from '../../services/emailService.js';

jest.mock('../../logger/logger.js');
jest.mock('../../services/userService.js');
jest.mock('../../security/passwordUtil.js');
jest.mock('../../services/emailService.js');
jest.mock('../../security/TokenGenerator.js');
jest.mock('../../security/JWTProvider.js');

import logger from '../../logger/logger.js';
import userService from '../../services/userService.js';
import passwordUtil from '../../security/passwordUtil.js';
import TokenGenerator from '../../security/TokenGenerator.js';
import JWTProvider from '../../security/JWTProvider.js';

describe('authController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, query: {}, params: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        jest.spyOn(emailServiceModule, 'sendEmail').mockImplementation(jest.fn());

        logger.info = jest.fn();
        logger.warn = jest.fn();
        logger.error = jest.fn();
        userService.getUserByUserName = jest.fn();
        userService.getUserByEmail = jest.fn();
        userService.createUser = jest.fn();
        userService.insertVerificationToken = jest.fn();
        userService.findByVerificationToken = jest.fn();
        userService.verifyUser = jest.fn();
        passwordUtil.hashPassword = jest.fn();
        passwordUtil.comparePasswords = jest.fn();
        TokenGenerator.generateToken = jest.fn();
        JWTProvider.generateJWT = jest.fn();
    });

    const invalidBase64 = '%%%';

    describe('registerUser', () => {
        it('should register user and send verification email', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass', role: 'USER' };
            userService.getUserByUserName.mockResolvedValue(null);
            userService.getUserByEmail.mockResolvedValue(null);
            passwordUtil.hashPassword.mockResolvedValue('hashed');
            userService.createUser.mockResolvedValue({ id: 1, email: 'test@test.com', username: 'user', role: 'USER' });
            TokenGenerator.generateToken.mockReturnValue('token123');
            emailServiceModule.sendEmail.mockResolvedValue(undefined);
            userService.insertVerificationToken.mockResolvedValue(undefined);

            await authController.registerUser(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "User registered. Please verify your email." });
        });

        it('should return 400 if missing fields', async () => {
            req.body = {};
            await authController.registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Username, email, and password are required' });
        });

        it('should return 409 if username exists', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass' };
            userService.getUserByUserName.mockResolvedValue({ id: 1 });
            userService.getUserByEmail.mockResolvedValue(null);
            await authController.registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "Username already exists" });
        });

        it('should return 409 if email exists', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass' };
            userService.getUserByUserName.mockResolvedValue(null);
            userService.getUserByEmail.mockResolvedValue({ id: 2 });
            await authController.registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "Email already exists" });
        });

        it('should return 409 if both username and email exist', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass' };
            userService.getUserByUserName.mockResolvedValue({ id: 1 });
            userService.getUserByEmail.mockResolvedValue({ id: 2 });
            await authController.registerUser(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "Username and email already exist" });
        });

        it('should return 401 if error.errno === 1265', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass' };
            const error = new Error('fail');
            error.errno = 1265;
            userService.getUserByUserName.mockRejectedValue(error);
            await authController.registerUser(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
        });

        it('should handle error if sendEmail throws', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass', role: 'USER' };
            userService.getUserByUserName.mockResolvedValue(null);
            userService.getUserByEmail.mockResolvedValue(null);
            passwordUtil.hashPassword.mockResolvedValue('hashed');
            userService.createUser.mockResolvedValue({ id: 1, email: 'test@test.com', username: 'user', role: 'USER' });
            TokenGenerator.generateToken.mockReturnValue('token123');
            emailServiceModule.sendEmail.mockRejectedValue(new Error('fail'));
            await authController.registerUser(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed' });
        });

        it('should handle error if insertVerificationToken throws', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass', role: 'USER' };
            userService.getUserByUserName.mockResolvedValue(null);
            userService.getUserByEmail.mockResolvedValue(null);
            passwordUtil.hashPassword.mockResolvedValue('hashed');
            userService.createUser.mockResolvedValue({ id: 1, email: 'test@test.com', username: 'user', role: 'USER' });
            TokenGenerator.generateToken.mockReturnValue('token123');
            emailServiceModule.sendEmail.mockResolvedValue();
            userService.insertVerificationToken.mockRejectedValue(new Error('fail'));
            await authController.registerUser(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed' });
        });

        it('should handle generic error', async () => {
            req.body = { username: 'user', email: 'test@test.com', password: 'pass' };
            userService.getUserByUserName.mockRejectedValue(new Error('fail'));
            await authController.registerUser(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Registration failed' });
        });
    });

    describe('loginUser', () => {
        it('should login user and return accessToken', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue({ password: 'hashed' });
            passwordUtil.comparePasswords.mockResolvedValue(true);
            JWTProvider.generateJWT.mockReturnValue('jwt-token');
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken: 'jwt-token' });
        });

        it('should return 400 if missing username/email', async () => {
            req.body = { password: 'pass' };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if missing password', async () => {
            req.body = { username: 'user' };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Password is required." });
        });

        it('should return 401 if user not found', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue(null);
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 if password does not match', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue({ password: 'hashed' });
            passwordUtil.comparePasswords.mockResolvedValue(false);
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle error', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockRejectedValue(new Error('fail'));
            await authController.loginUser(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 400 if decoded password is empty', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: Buffer.from('').toString('base64')
            };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Password is required." });
        });

        it('should login with email only', async () => {
            req.body = {
                email: Buffer.from('test@test.com').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByEmail.mockResolvedValue({ password: 'hashed' });
            passwordUtil.comparePasswords.mockResolvedValue(true);
            JWTProvider.generateJWT.mockReturnValue('jwt-token');
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken: 'jwt-token' });
        });

        it('should handle invalid base64 in username', async () => {
            req.body = {
                username: invalidBase64,
                password: Buffer.from('pass').toString('base64')
            };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle invalid base64 in email', async () => {
            req.body = {
                email: invalidBase64,
                password: Buffer.from('pass').toString('base64')
            };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle invalid base64 in password', async () => {
            req.body = {
                username: Buffer.from('user').toString('base64'),
                password: invalidBase64
            };
            await authController.loginUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Password is required" });
        });
    });

    describe('logoutUser', () => {
        it('should logout user', async () => {
            await authController.logoutUser(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "User logged out successfully" });
        });
    });

    describe('verifyEmail', () => {
        it('should verify email', async () => {
            req.query = { token: 'token123' };
            userService.findByVerificationToken.mockResolvedValue({ id: 1 });
            userService.verifyUser.mockResolvedValue();
            await authController.verifyEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Email verified successfully!');
        });

        it('should return 400 for invalid token', async () => {
            req.query = { token: 'token123' };
            userService.findByVerificationToken.mockResolvedValue(null);
            await authController.verifyEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should handle error', async () => {
            req.query = { token: 'token123' };
            userService.findByVerificationToken.mockRejectedValue(new Error('fail'));
            await authController.verifyEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should handle error thrown by verifyUser', async () => {
            req.query = { token: 'token123' };
            userService.findByVerificationToken.mockResolvedValue({ id: 1 });
            userService.verifyUser.mockRejectedValue(new Error('fail'));
            await authController.verifyEmail(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error verifying email' }));
        });
    });

    describe('loginWorker', () => {
        it('should login worker and return accessToken', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue({ password: 'hashed', role: 'WORKER' });
            passwordUtil.comparePasswords.mockResolvedValue(true);
            JWTProvider.generateJWT.mockReturnValue('jwt-token');
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken: 'jwt-token' });
        });

        it('should return 400 if missing password', async () => {
            req.body = { username: 'worker' };
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if missing username/email', async () => {
            req.body = { password: 'pass' };
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 401 if user not found', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue(null);
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 if not worker account', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue({ password: 'hashed', role: 'USER' });
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 if password does not match', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockResolvedValue({ password: 'hashed', role: 'WORKER' });
            passwordUtil.comparePasswords.mockResolvedValue(false);
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle error', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByUserName.mockRejectedValue(new Error('fail'));
            await authController.loginWorker(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should login worker with email only', async () => {
            req.body = {
                email: Buffer.from('worker@test.com').toString('base64'),
                password: Buffer.from('pass').toString('base64')
            };
            userService.getUserByEmail.mockResolvedValue({ password: 'hashed', role: 'WORKER' });
            passwordUtil.comparePasswords.mockResolvedValue(true);
            JWTProvider.generateJWT.mockReturnValue('jwt-token');
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken: 'jwt-token' });
        });

        it('should handle invalid base64 in username', async () => {
            req.body = {
                username: invalidBase64,
                password: Buffer.from('pass').toString('base64')
            };
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle invalid base64 in email', async () => {
            req.body = {
                email: invalidBase64,
                password: Buffer.from('pass').toString('base64')
            };
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle invalid base64 in password', async () => {
            req.body = {
                username: Buffer.from('worker').toString('base64'),
                password: invalidBase64
            };
            await authController.loginWorker(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
});