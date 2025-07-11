import express from 'express';
import { loginAdmin, assignOrder, getWorkers, getWorkerOrders } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import userRepository from '../repositories/userRepositories.js';
import orderRepository from '../repositories/orderRepository.js';

const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

// Get all users (calls repository)
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const users = await userRepository.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all orders with worker name (calls repository)
router.get('/orders', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const orders = await orderRepository.getAllOrdersWithWorker();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Assign order to worker (controller handles logic)
router.post('/assign-order', verifyToken, requireRole('admin'), assignOrder);

// Get all workers (controller handles logic)
router.get('/workers', verifyToken, requireRole('admin'), getWorkers);

// Get orders assigned to a worker (controller handles logic)
router.get('/worker/:workerId/orders', verifyToken, requireRole('admin'), getWorkerOrders);

export default router;