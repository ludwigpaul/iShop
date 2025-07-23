import { jest } from '@jest/globals';

jest.mock('../../models/index.js', () => ({
    Users: {
        findAndCountAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        findAll: jest.fn(),
    },
    Sequelize: {
        Op: {
            or: Symbol('or'),
            like: Symbol('like'),
            iLike: Symbol('iLike'),
            eq: Symbol('eq'),
            gte: Symbol('gte')
        }
    }
}));
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));
jest.mock('bcryptjs', () => ({
    compare: jest.fn()
}));

import db from '../../models/index.js';
import logger from '../../logger/logger.js';
import bcrypt from 'bcryptjs';
import userRepository from '../../repositories/userRepository.js';

beforeEach(() => {
    jest.clearAllMocks();
});

describe('userRepository', () => {
    describe('getAllUsers', () => {
        it('should return users and total count', async () => {
            db.Users.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 1 }, { id: 2 }] });
            const result = await userRepository.getAllUsers(1, 2);
            expect(result).toEqual({ users: { count: 2, rows: [{ id: 1 }, { id: 2 }] }, total: 2 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle default params', async () => {
            db.Users.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            const result = await userRepository.getAllUsers();
            expect(result).toEqual({ users: { count: 0, rows: [] }, total: 0 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle negative and non-numeric offset/limit', async () => {
            db.Users.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            await userRepository.getAllUsers(-5, -10);
            expect(db.Users.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: -5,
                limit: -10
            }));
            await userRepository.getAllUsers('abc', 'xyz');
            expect(db.Users.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: 'abc',
                limit: 'xyz'
            }));
        });
    });

    describe('getUserById', () => {
        it('should return user by id', async () => {
            db.Users.findByPk.mockResolvedValue({ id: 1 });
            const result = await userRepository.getUserById(1);
            expect(result).toEqual({ id: 1 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Users.findByPk.mockResolvedValue(undefined);
            const result = await userRepository.getUserById(999);
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing id', async () => {
            db.Users.findByPk.mockResolvedValue(undefined);
            const result = await userRepository.getUserById();
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('createUser', () => {
        it('should create a new user', async () => {
            db.Users.create.mockResolvedValue({ id: 3, username: 'Test', email: 'test@test.com', verified: false });
            const result = await userRepository.createUser({ username: 'Test', email: 'test@test.com', password: 'pass' });
            expect(result).toEqual({ id: 3, username: 'Test', email: 'test@test.com', verified: false });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing user fields', async () => {
            db.Users.create.mockResolvedValue({ id: 4, username: undefined, email: undefined, verified: false });
            const result = await userRepository.createUser({});
            expect(result).toEqual({ id: 4, username: undefined, email: undefined, verified: false });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('getUserByEmail', () => {
        it('should return user by email', async () => {
            db.Users.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });
            const result = await userRepository.getUserByEmail('test@test.com');
            expect(result).toEqual({ id: 1, email: 'test@test.com' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getUserByEmail('notfound@test.com');
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing email', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getUserByEmail();
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('getUserByUserName', () => {
        it('should return user by username', async () => {
            db.Users.findOne.mockResolvedValue({ id: 2, username: 'user' });
            const result = await userRepository.getUserByUserName('user');
            expect(result).toEqual({ id: 2, username: 'user' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getUserByUserName('nouser');
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing username', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getUserByUserName();
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update user', async () => {
            db.Users.update.mockResolvedValue([1, { id: 1, username: 'updated' }]);
            await expect(userRepository.updateUser(1, { username: 'updated' })).resolves.toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should throw error if user not found', async () => {
            db.Users.update.mockResolvedValue([0]);
            await expect(userRepository.updateUser(99, { username: 'none' })).rejects.toThrow('User not found');
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        it('should delete user and return success message', async () => {
            db.Users.destroy.mockResolvedValue(1);
            const result = await userRepository.deleteUser(1);
            expect(result).toEqual({ message: 'User deleted successfully' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return not found message if nothing deleted', async () => {
            db.Users.destroy.mockResolvedValue(0);
            const result = await userRepository.deleteUser(2);
            expect(result).toEqual({ message: 'User not found' });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('findUsers', () => {
        it('should find users by search term', async () => {
            db.Users.findAll.mockResolvedValue([{ id: 1, username: 'search' }]);
            const result = await userRepository.findUsers('search', 0, 10);
            expect(result).toEqual([{ id: 1, username: 'search' }]);
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return empty array if no users found', async () => {
            db.Users.findAll.mockResolvedValue([]);
            const result = await userRepository.findUsers('none', 0, 10);
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing searchTerm', async () => {
            db.Users.findAll.mockResolvedValue([]);
            const result = await userRepository.findUsers();
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('findByUsername', () => {
        it('should find user by username', async () => {
            db.Users.findOne.mockResolvedValue({ id: 1, username: 'user' });
            const result = await userRepository.findByUsername('user');
            expect(result).toEqual({ id: 1, username: 'user' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.findByUsername('nouser');
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing username', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.findByUsername();
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('getAdminByUsername', () => {
        it('should get admin user by username', async () => {
            db.Users.findOne.mockResolvedValue({ id: 1, username: 'admin', role: 'ADMIN' });
            const result = await userRepository.getAdminByUsername('admin');
            expect(result).toEqual({ id: 1, username: 'admin', role: 'ADMIN' });
        });
        it('should return undefined if admin not found', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getAdminByUsername('noadmin');
            expect(result).toBeUndefined();
        });
        it('should handle missing username', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.getAdminByUsername();
            expect(result).toBeUndefined();
        });
    });

    describe('comparePassword', () => {
        it('should compare password and hash (true)', async () => {
            bcrypt.compare.mockResolvedValue(true);
            const result = await userRepository.comparePassword('plain', 'hash');
            expect(result).toBe(true);
        });
        it('should compare password and hash (false)', async () => {
            bcrypt.compare.mockResolvedValue(false);
            const result = await userRepository.comparePassword('plain', 'hash');
            expect(result).toBe(false);
        });
    });

    describe('findByVerificationToken', () => {
        it('should find user by verification token', async () => {
            db.Users.findOne.mockResolvedValue({ id: 1, verification_token: 'token' });
            const result = await userRepository.findByVerificationToken('token', new Date());
            expect(result).toEqual({ id: 1, verification_token: 'token' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.findByVerificationToken('notoken', new Date());
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should handle missing token', async () => {
            db.Users.findOne.mockResolvedValue(undefined);
            const result = await userRepository.findByVerificationToken();
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('insertVerificationToken', () => {
        it('should insert verification token', async () => {
            db.Users.update.mockResolvedValue([1]);
            await expect(userRepository.insertVerificationToken(1, 'token', new Date())).resolves.toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should throw error if user not found', async () => {
            db.Users.update.mockResolvedValue([0]);
            await expect(userRepository.insertVerificationToken(99, 'token', new Date())).rejects.toThrow('User not found');
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('verifyUser', () => {
        it('should verify user', async () => {
            db.Users.update.mockResolvedValue([1]);
            await expect(userRepository.verifyUser(1, new Date())).resolves.toBeUndefined();
        });
        it('should throw error if user not found', async () => {
            db.Users.update.mockResolvedValue([0]);
            await expect(userRepository.verifyUser(99, new Date())).rejects.toThrow('User not found');
            expect(logger.warn).toHaveBeenCalled();
        });
    });
});