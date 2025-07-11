
import userService from '../services/userService.js';
import logger from "../logger/logger.js";
import passwordUtil from "../security/passwordUtil.js";
import {generateJWTForAdmin} from "../security/JWTProvider.js";

import dotenv from 'dotenv';
dotenv.config();

// Admin login - this function authenticates an admin user
// It checks the provided username to assert that it exists and that the
// role is ADMIN.
// Then, it checks the password against the database using bcrypt.
// Finally, it generates a JWT token for the admin user.
export async function loginAdmin(req, res) {
    try {
        const {username, password} = req.body;
        const user = await userService.getAdminByUsername(username);
        if (!user) {
            logger.warn(`Admin with username ${username} not found`);
            return res.status(401).json({error: 'Invalid credentials or not an admin'});
        }
        const valid = await passwordUtil.comparePassword(password, user.password);
        if (!valid) {
            return res.status(401).json({error: 'Invalid credentials or not an admin'});
        }
        const token = generateJWTForAdmin(user);
        res.json({token: token});
    } catch (err) {
        logger.error('Admin login error:', err);
        res.status(500).json({error: 'Internal server error'});
    }
}

// Assign order to worker
export async function assignOrder(req, res) {
    try {
        const {orderId, workerId} = req.body;
        logger.info(`Assigning order ${orderId} to worker ${workerId}`);
        await userService.assignOrderToWorker(Number(orderId), Number(workerId));
        res.json({success: true, orderId, workerId});
    } catch (err) {
        logger.error('Assign order error:', err);
        res.status(500).json({error: 'Failed to assign order'});
    }
}

// Get all workers
// TODO: Implement pagination and filtering
export async function getWorkers(req, res) {
    try {
        const workers = await userService.getAllWorkers();
        res.json(workers);
    } catch (err) {
        logger.error('Get workers error:', err);
        res.status(500).json({error: 'Failed to fetch workers'});
    }
}

// Get orders assigned to a worker
// This function retrieves all orders assigned to a specific worker
// TODO: Implement pagination and filtering
export async function getWorkerOrders(req, res) {
    try {
        const {workerId} = req.params;
        const orders = await userService.getOrdersByWorker(workerId);
        res.json(orders);
    } catch (err) {
        logger.error('Get worker orders error:', err);
        res.status(500).json({error: 'Failed to fetch worker orders'});
    }
}

// This function retrieves all users from the database
// TODO: Implement pagination and filtering
export async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();
        logger.info(`Fetched all users successfully. Total users: ${users.length}`);
        res.status(200).json(users);
    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({error: 'Failed to fetch users'});
    }
}