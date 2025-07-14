// routes/adminRoutes.js
import express from 'express';
import {
    loginAdmin,
    assignOrder,
    getWorkers,
    getWorkerOrders,
    getAllUsers,
    getAllOrders
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);
router.get('/orders', verifyToken, requireRole('admin'), getAllOrders);
router.post('/assign-order', verifyToken, requireRole('admin'), assignOrder);
router.get('/workers', verifyToken, requireRole('admin'), getWorkers);
router.get('/worker/:workerId/orders', verifyToken, requireRole('admin'), getWorkerOrders);

export default router;