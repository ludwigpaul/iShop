// controllers/adminController.js
import userRepository from '../repositories/userRepositories.js';
import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';
import logger from "../logger/logger.js";

// Admin login
export async function loginAdmin(req, res) {
    try {
        const { username, password } = req.body;
        const user = await userRepository.findByUsername(username);
        if (!user || user.role.toUpperCase() !== 'ADMIN') {
            return res.status(401).json({ error: 'Invalid credentials or not an admin' });
        }
        const valid = await userRepository.comparePassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials or not an admin' });
        }
        const token = jwt.sign(
            { id: user.id, role: user.role.toLowerCase() },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    } catch (err) {
        logger.error('Admin login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Assign order to worker
export async function assignOrder(req, res) {
    try {
        const { orderId, workerId } = req.body;
        logger.info(`Assigning order ${orderId} to worker ${workerId}`);
        await userService.assignOrderToWorker(Number(orderId), Number(workerId));
        res.json({ success: true, orderId, workerId });
    } catch (err) {
        logger.error('Assign order error:', err);
        res.status(500).json({ error: 'Failed to assign order' });
    }
}

// Get all workers
export async function getWorkers(req, res) {
    try {
        const workers = await userService.getAllWorkers();
        res.json(workers);
    } catch (err) {
        logger.error('Get workers error:', err);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
}

// Get orders assigned to a worker
export async function getWorkerOrders(req, res) {
    try {
        const { workerId } = req.params;
        const orders = await userService.getOrdersByWorker(workerId);
        res.json(orders);
    } catch (err) {
        logger.error('Get worker orders error:', err);
        res.status(500).json({ error: 'Failed to fetch worker orders' });
    }
}