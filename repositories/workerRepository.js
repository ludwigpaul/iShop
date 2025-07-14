import { db } from "../config/dbConfig.js";
import logger from "../logger/logger.js";
import bcrypt from 'bcryptjs';

const getAllWorkers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [workers] = await db.query(
        'SELECT * FROM ishop.workers LIMIT ? OFFSET ?',
        [Number(limit), Number(offset)]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM ishop.workers');
    return { workers, total };
};

const assignOrderToWorker = async (orderId, workerId) => {
    logger.info(`Assigning order ${orderId} to worker ${workerId}`);
    await db.query('UPDATE ishop.orders SET worker_id = ? WHERE id = ?', [workerId, orderId]);
    logger.info(`Assigned order ${orderId} to worker ${workerId}`);
};

const getOrdersByWorker = async (workerId) => {
    const [rows] = await db.query(
        'SELECT id, description, completed_at FROM ishop.orders WHERE worker_id = ?',
        [workerId]
    );
    return rows;
};

export default {
    getAllWorkers,
    assignOrderToWorker,
    getOrdersByWorker
};