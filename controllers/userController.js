import * as userService from '../services/userService.js';
import {logger} from '../logger/logger.js';

function getErrorMessage(err) {
    return err && err.message ? err.message : String(err);
}

export async function getAllUsers(req, res) {
    try {
        logger.info('Fetching all users');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const users = await userService.getAllUsers();
        res.json({ users, page, limit });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function getUserById(req, res) {
    try {
        logger.info(`Fetching user with ID: ${req.params.id}`);
        if (!req.params.id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function getUserByEmail(req, res) {
    try {
        logger.info(`Fetching user with email: ${req.params.email}`);
        const user = await userService.getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function createUser(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function updateUser(req, res) {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function deleteUser(req, res) {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export async function findUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const users = await userService.findUsers(req.query.searchTerm, page, limit);
        res.json({ users, page, limit });
    } catch (err) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}

export default {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    findUsers
};