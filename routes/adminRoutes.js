import express from 'express';
import { loginAdmin, assignOrder, getWorkers, getWorkerOrders, getAllUsers,  } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {getOrdersByWorkerId} from "../controllers/orderController.js";

const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

// Get all users from the database
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);

// Get all orders with worker name (calls repository)
router.get('/orders', verifyToken, requireRole('admin'), getOrdersByWorkerId);

// Assign order to worker (controller handles logic)
router.post('/assign-order', verifyToken, requireRole('admin'), assignOrder);

// Get all workers (controller handles logic)
router.get('/workers', verifyToken, requireRole('admin'), getWorkers);

// Get orders assigned to a worker (controller handles logic)
router.get('/worker/:workerId/orders', verifyToken, requireRole('admin'), getWorkerOrders);

export default router;