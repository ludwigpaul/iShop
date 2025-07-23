import * as userService from '../../services/userService.js';
import * as userController from '../../controllers/userController.js';
import { jest } from '@jest/globals';

jest.mock('../../services/userService.js');

const ensureMock = (fnName) => {
    if (!userService[fnName] || typeof userService[fnName].mockClear !== 'function') {
        userService[fnName] = jest.fn();
    }
};

describe('userController', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        
        [
            'getAllUsers',
            'getUserById',
            'getUserByEmail',
            'createUser',
            'updateUser',
            'deleteUser',
            'findUsers'
        ].forEach(ensureMock);

        userService.getAllUsers.mockClear();
        userService.getUserById.mockClear();
        userService.getUserByEmail.mockClear();
        userService.createUser.mockClear();
        userService.updateUser.mockClear();
        userService.deleteUser.mockClear();
        userService.findUsers.mockClear();
    });

    describe('getAllUsers', () => {
        it('should return users with pagination', async () => {
            userService.getAllUsers.mockResolvedValue([{ id: 1 }]);
            req.query = { page: '2', limit: '5' };
            await userController.getAllUsers(req, res);
            expect(res.json).toHaveBeenCalledWith({ users: [{ id: 1 }], page: 2, limit: 5 });
        });

        it('should handle error', async () => {
            userService.getAllUsers.mockRejectedValue(new Error('fail'));
            await userController.getAllUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('getUserById', () => {
        it('should return user', async () => {
            req.params = { id: 1 };
            userService.getUserById.mockResolvedValue({ id: 1 });
            await userController.getUserById(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 404 if not found', async () => {
            req.params = { id: 1 };
            userService.getUserById.mockResolvedValue(null);
            await userController.getUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            userService.getUserById.mockRejectedValue(new Error('fail'));
            await userController.getUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });

        it('should return 400 if user id is missing', async () => {
            req.params = {}; // No id
            await userController.getUserById(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

    });

    describe('getUserByEmail', () => {
        it('should return user', async () => {
            req.params = { email: 'test@test.com' };
            userService.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });
            await userController.getUserByEmail(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1, email: 'test@test.com' });
        });

        it('should return 404 if not found', async () => {
            req.params = { email: 'test@test.com' };
            userService.getUserByEmail.mockResolvedValue(null);
            await userController.getUserByEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle error', async () => {
            req.params = { email: 'test@test.com' };
            userService.getUserByEmail.mockRejectedValue(new Error('fail'));
            await userController.getUserByEmail(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('createUser', () => {
        it('should create user', async () => {
            req.body = { username: 'user' };
            userService.createUser.mockResolvedValue({ id: 1, username: 'user' });
            await userController.createUser(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'user' });
        });

        it('should handle error', async () => {
            req.body = { username: 'user' };
            userService.createUser.mockRejectedValue(new Error('fail'));
            await userController.createUser(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            req.params = { id: 1 };
            req.body = { username: 'updated' };
            userService.updateUser.mockResolvedValue({ id: 1, username: 'updated' });
            await userController.updateUser(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'updated' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            req.body = { username: 'updated' };
            userService.updateUser.mockRejectedValue(new Error('fail'));
            await userController.updateUser(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });

        it('should handle errors in updateUser', async () => {
            req.params = { id: 1 };
            req.body = { name: 'Test' };
            userService.updateUser.mockRejectedValue(new Error('Update failed'));
            await userController.updateUser(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
        });

        it('should return 400 if user id is missing', async () => {
            req.params = {}; // No id
            await userController.updateUser(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User ID is required' });
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            req.params = { id: 1 };
            userService.deleteUser.mockResolvedValue(true); // <-- Fix here
            await userController.deleteUser(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            userService.deleteUser.mockRejectedValue(new Error('fail'));
            await userController.deleteUser(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('findUsers', () => {
        it('should find users with pagination', async () => {
            req.query = { searchTerm: 'user', page: '3', limit: '7' };
            userService.findUsers.mockResolvedValue([{ id: 1 }]);
            await userController.findUsers(req, res);
            expect(res.json).toHaveBeenCalledWith({ users: [{ id: 1 }], page: 3, limit: 7 });
        });

        it('should handle error', async () => {
            req.query = { searchTerm: 'user', page: '3', limit: '7' };
            userService.findUsers.mockRejectedValue(new Error('fail'));
            await userController.findUsers(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });
});