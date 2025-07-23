import { jest } from '@jest/globals';

import userService from '../../services/userService.js';
import userRepository from '../../repositories/userRepository.js';

jest.mock('../../repositories/userRepository.js', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByUserName: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    findUsers: jest.fn()
}));

describe('User Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            userRepository.getAllUsers.mockResolvedValue(['user1', 'user2']);
            const result = await userService.getAllUsers(1, 10);
            expect(userRepository.getAllUsers).toHaveBeenCalledWith(0, 10);
            expect(result).toEqual(['user1', 'user2']);
        });

        it('should default page and limit if not provided', async () => {
            userRepository.getAllUsers.mockResolvedValue(['user1']);
            await userService.getAllUsers();
            expect(userRepository.getAllUsers).toHaveBeenCalledWith(0, 10);
        });

        it('should clamp page and limit to at least 1', async () => {
            userRepository.getAllUsers.mockResolvedValue(['user1']);
            await userService.getAllUsers(0, 0);
            expect(userRepository.getAllUsers).toHaveBeenCalledWith(0, 1);
            await userService.getAllUsers(-5, -10);
            expect(userRepository.getAllUsers).toHaveBeenCalledWith(0, 1);
        });

        it('should parse non-numeric page and limit', async () => {
            userRepository.getAllUsers.mockResolvedValue(['user1']);
            await userService.getAllUsers('abc', 'xyz');
            expect(userRepository.getAllUsers).toHaveBeenCalledWith(0, 10);
        });

        it('should throw on repository error', async () => {
            userRepository.getAllUsers.mockRejectedValue(new Error('fail'));
            await expect(userService.getAllUsers(1, 10)).rejects.toThrow('fail');
        });
    });

    it('getUserById should return user by id', async () => {
        userRepository.getUserById.mockResolvedValue({ id: 1, name: 'Alice' });
        const result = await userService.getUserById(1);
        expect(userRepository.getUserById).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1, name: 'Alice' });
    });

    it('getUserById should throw if id is missing', async () => {
        await expect(userService.getUserById()).rejects.toThrow('User ID is required');
    });

    it('getUserById should throw on repository error', async () => {
        userRepository.getUserById.mockRejectedValue(new Error('fail'));
        await expect(userService.getUserById(1)).rejects.toThrow('fail');
    });

    it('getUserByEmail should return user by email', async () => {
        userRepository.getUserByEmail.mockResolvedValue({ id: 2, email: 'bob@example.com' });
        const result = await userService.getUserByEmail('bob@example.com');
        expect(userRepository.getUserByEmail).toHaveBeenCalledWith('bob@example.com');
        expect(result).toEqual({ id: 2, email: 'bob@example.com' });
    });

    it('getUserByEmail should throw if email is missing', async () => {
        await expect(userService.getUserByEmail()).rejects.toThrow('Email is required');
    });

    it('getUserByEmail should throw on repository error', async () => {
        userRepository.getUserByEmail.mockRejectedValue(new Error('fail'));
        await expect(userService.getUserByEmail('bob@example.com')).rejects.toThrow('fail');
    });

    it('getUserByUserName should return user by username', async () => {
        userRepository.getUserByUserName.mockResolvedValue({ id: 3, username: 'charlie' });
        const result = await userService.getUserByUserName('charlie');
        expect(userRepository.getUserByUserName).toHaveBeenCalledWith('charlie');
        expect(result).toEqual({ id: 3, username: 'charlie' });
    });

    it('getUserByUserName should throw if username is missing', async () => {
        await expect(userService.getUserByUserName()).rejects.toThrow('Username is required');
    });

    it('getUserByUserName should throw on repository error', async () => {
        userRepository.getUserByUserName.mockRejectedValue(new Error('fail'));
        await expect(userService.getUserByUserName('charlie')).rejects.toThrow('fail');
    });

    describe('createUser', () => {
        it('should create a user', async () => {
            userRepository.createUser.mockResolvedValue({ id: 4, name: 'Dave' });
            const result = await userService.createUser({ name: 'Dave' });
            expect(userRepository.createUser).toHaveBeenCalledWith({ name: 'Dave' });
            expect(result).toEqual({ id: 4, name: 'Dave' });
        });

        it('should throw if user is missing', async () => {
            await expect(userService.createUser()).rejects.toThrow('User data is required');
        });

        it('should throw if user is not an object', async () => {
            await expect(userService.createUser('not-an-object')).rejects.toThrow('User data is required');
        });

        it('should throw on repository error', async () => {
            userRepository.createUser.mockRejectedValue(new Error('fail'));
            await expect(userService.createUser({ name: 'Dave' })).rejects.toThrow('fail');
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            userRepository.updateUser.mockResolvedValue({ id: 1, name: 'Updated Alice' });
            const result = await userService.updateUser(1, { name: 'Updated Alice' });
            expect(userRepository.updateUser).toHaveBeenCalledWith(1, { name: 'Updated Alice' });
            expect(result).toEqual({ id: 1, name: 'Updated Alice' });
        });

        it('should throw if id is missing', async () => {
            await expect(userService.updateUser(undefined, { name: 'x' })).rejects.toThrow('User ID is required');
        });

        it('should throw if user is missing', async () => {
            await expect(userService.updateUser(1)).rejects.toThrow('User data is required');
        });

        it('should throw if user is not an object', async () => {
            await expect(userService.updateUser(1, 'not-an-object')).rejects.toThrow('User data is required');
        });

        it('should throw on repository error', async () => {
            userRepository.updateUser.mockRejectedValue(new Error('fail'));
            await expect(userService.updateUser(1, { name: 'x' })).rejects.toThrow('fail');
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            userRepository.deleteUser.mockResolvedValue(true);
            const result = await userService.deleteUser(1);
            expect(userRepository.deleteUser).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('should throw if id is missing', async () => {
            await expect(userService.deleteUser()).rejects.toThrow('User ID is required');
        });

        it('should throw on repository error', async () => {
            userRepository.deleteUser.mockRejectedValue(new Error('fail'));
            await expect(userService.deleteUser(1)).rejects.toThrow('fail');
        });
    });

    describe('findUsers', () => {
        it('should find users by search term', async () => {
            userRepository.findUsers.mockResolvedValue([{ id: 5, name: 'Eve' }]);
            const result = await userService.findUsers('Eve', 1, 10);
            expect(userRepository.findUsers).toHaveBeenCalledWith('Eve', 0, 10);
            expect(result).toEqual([{ id: 5, name: 'Eve' }]);
        });

        it('should default page and limit if not provided', async () => {
            userRepository.findUsers.mockResolvedValue(['user1']);
            await userService.findUsers('search');
            expect(userRepository.findUsers).toHaveBeenCalledWith('search', 0, 10);
        });

        it('should clamp page and limit to at least 1', async () => {
            userRepository.findUsers.mockResolvedValue(['user1']);
            await userService.findUsers('search', 0, 0);
            expect(userRepository.findUsers).toHaveBeenCalledWith('search', 0, 1);
            await userService.findUsers('search', -5, -10);
            expect(userRepository.findUsers).toHaveBeenCalledWith('search', 0, 1);
        });

        it('should parse non-numeric page and limit', async () => {
            userRepository.findUsers.mockResolvedValue(['user1']);
            await userService.findUsers('search', 'abc', 'xyz');
            expect(userRepository.findUsers).toHaveBeenCalledWith('search', 0, 10);
        });

        it('should throw if searchTerm is missing', async () => {
            await expect(userService.findUsers()).rejects.toThrow('Search term is required');
        });

        it('should throw on repository error', async () => {
            userRepository.findUsers.mockRejectedValue(new Error('fail'));
            await expect(userService.findUsers('Eve', 1, 10)).rejects.toThrow('fail');
        });
    });
});