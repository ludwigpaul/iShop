import * as adminController from '../../controllers/adminController.js';
import { jest } from '@jest/globals';

jest.mock('../../repositories/userRepository.js');
jest.mock('../../repositories/orderRepository.js');
jest.mock('../../repositories/workerRepository.js');
jest.mock('jsonwebtoken');
jest.mock('../../services/userService.js');
jest.mock('../../logger/logger.js');

import userRepository from '../../repositories/userRepository.js';
import orderRepository from '../../repositories/orderRepository.js';
import workerRepository from '../../repositories/workerRepository.js';
import jwt from 'jsonwebtoken';
import userService from '../../services/userService.js';
import logger from '../../logger/logger.js';

describe('adminController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {}, params: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        userRepository.getAllUsers = jest.fn();
        userRepository.findByUsername = jest.fn();
        userRepository.comparePassword = jest.fn();
        orderRepository.getAllOrdersWithWorker = jest.fn();
        workerRepository.getAllWorkers = jest.fn();
        jwt.sign = jest.fn();
        userService.assignOrderToWorker = jest.fn();
        userService.getOrdersByWorker = jest.fn();
        logger.error = jest.fn();
        logger.info = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return users on success', async () => {
            userRepository.getAllUsers.mockResolvedValue([{ id: 1 }]);
            await adminController.getAllUsers(req, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            userRepository.getAllUsers.mockRejectedValue(new Error('fail'));
            await adminController.getAllUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('loginAdmin', () => {
        beforeEach(() => {
            process.env.JWT_SECRET = 'testsecret';
        });

        it('should return token for valid admin', async () => {
            req.body = { username: 'admin', password: 'pass' };
            userRepository.findByUsername.mockResolvedValue({ id: 1, role: 'ADMIN', password: 'hashed' });
            userRepository.comparePassword.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token123');
            await adminController.loginAdmin(req, res);
            expect(res.json).toHaveBeenCalledWith({ token: 'token123' });
        });

        it('should return 401 for invalid user', async () => {
            req.body = { username: 'user', password: 'pass' };
            userRepository.findByUsername.mockResolvedValue(null);
            await adminController.loginAdmin(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials or not an admin' });
        });

        it('should return 401 for wrong role', async () => {
            req.body = { username: 'user', password: 'pass' };
            userRepository.findByUsername.mockResolvedValue({ id: 2, role: 'USER', password: 'hashed' });
            await adminController.loginAdmin(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 401 for wrong password', async () => {
            req.body = { username: 'admin', password: 'wrong' };
            userRepository.findByUsername.mockResolvedValue({ id: 1, role: 'ADMIN', password: 'hashed' });
            userRepository.comparePassword.mockResolvedValue(false);
            await adminController.loginAdmin(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should handle error', async () => {
            userRepository.findByUsername.mockRejectedValue(new Error('fail'));
            await adminController.loginAdmin(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('assignOrder', () => {
        it('should assign order and return success', async () => {
            req.body = { orderId: 1, workerId: 2 };
            userService.assignOrderToWorker.mockResolvedValue();
            await adminController.assignOrder(req, res);
            expect(userService.assignOrderToWorker).toHaveBeenCalledWith(1, 2);
            expect(res.json).toHaveBeenCalledWith({ success: true, orderId: 1, workerId: 2 });
        });

        it('should handle error', async () => {
            userService.assignOrderToWorker.mockRejectedValue(new Error('fail'));
            req.body = { orderId: 1, workerId: 2 };
            await adminController.assignOrder(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to assign order' });
        });
    });

    describe('getWorkers', () => {
        it('should return workers', async () => {
            workerRepository.getAllWorkers.mockResolvedValue({ workers: [{ id: 1 }], total: 1 });
            req.query = { page: '1', limit: '10' };
            await adminController.getWorkers(req, res);
            expect(res.json).toHaveBeenCalledWith({ workers: [{ id: 1 }], total: 1, page: 1, limit: 10 });
        });

        it('should handle error', async () => {
            workerRepository.getAllWorkers.mockRejectedValue(new Error('fail'));
            await adminController.getWorkers(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('getWorkerOrders', () => {
        it('should return orders for worker', async () => {
            req.params = { workerId: 2 };
            userService.getOrdersByWorker.mockResolvedValue([{ id: 1 }]);
            await adminController.getWorkerOrders(req, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            userService.getOrdersByWorker.mockRejectedValue(new Error('fail'));
            req.params = { workerId: 2 };
            await adminController.getWorkerOrders(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch worker orders' });
        });
    });

    describe('getAllOrders', () => {
        it('should return all orders', async () => {
            orderRepository.getAllOrdersWithWorker.mockResolvedValue([{ id: 1 }]);
            await adminController.getAllOrders(req, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            orderRepository.getAllOrdersWithWorker.mockRejectedValue(new Error('fail'));
            await adminController.getAllOrders(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});