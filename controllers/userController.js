import userService from '../services/userService.js';
import logger from '../logger/logger.js';

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        logger.info('Getting all users with pagination', {page, limit});
        const users = await userService.getAllUsers(page, limit);
        res.json({ users, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserByEmail = async (req, res) => {
    try {
        const user = await userService.getUserByEmail(req.params.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const findUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const users = await userService.findUsers(req.query.searchTerm, page, limit);
        res.json({ users, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    findUsers
}