import express from 'express';
import { loginAdmin , assignOrder , getWorkers , getWorkerOrders  } from '../controllers/adminController.js'; // Import the controller
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import userRepository from '../repositories/userRepositories.js';
import orderRepository from '../repositories/orderRepository.js';

const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const users = await userRepository.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/orders', verifyToken, requireRole('admin'), async (req, res) => {
    try {
        const orders = await orderRepository.getAllOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/assign-order', verifyToken, requireRole('admin'), assignOrder);

router.get('/workers', verifyToken, requireRole('admin'), getWorkers);

router.get('/worker/:workerId/orders', verifyToken, requireRole('admin'), getWorkerOrders);


export default router;