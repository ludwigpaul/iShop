import express from 'express';
import { completeWorkerOrder } from '../controllers/workerController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { getWorkerOrders } from '../controllers/workerController.js';

const router = express.Router();

router.get('/:workerId/orders', verifyToken, requireRole('WORKER'), getWorkerOrders);
router.post('/:workerId/orders/:orderId/complete', verifyToken, requireRole('WORKER'), completeWorkerOrder);


export default router;