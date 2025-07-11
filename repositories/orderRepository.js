// repositories/orderRepository.js
import {db} from '../config/dbConfig.js';

// Get all orders
const getAllOrders = async () => {
    const [rows] = await db.query('SELECT * FROM ishop.orders');
    return rows;
};

// Get an order by ID
const getOrderById = async (id) => {
    const [rows] = await db.query('SELECT * FROM ishop.orders WHERE id = ?', [id]);
    return rows[0];
};

// Create a new order
const createOrder = async ({ userId, status, estimatedArrival, items }) => {
    const results = [];
    for (const item of items) {
        const [result] = await db.query(
            'INSERT INTO ishop.orders (user_id, product_id, quantity, status, estimated_arrival) VALUES (?, ?, ?, ?, ?)',
            [userId, item.productId, item.quantity, status, estimatedArrival]
        );
        results.push(result.insertId);
    }
    return results;
};

// Update an order by ID
const updateOrder = async (id, order) => {
    const {product_id, quantity} = order;
    await db.query('UPDATE ishop.orders SET product_id = ?, quantity = ? WHERE id = ?', [product_id, quantity, id]);
    return {id, product_id, quantity};
};

// Delete an order by ID
const deleteOrder = async (id) => {
    await db.query('DELETE FROM ishop.orders WHERE id = ?', [id]);
    return {message: 'Order deleted successfully'};
};

// Get orders by worker ID
const getOrdersByWorkerId = async (workerId) => {
    const [rows] = await db.query(
        `SELECT o.*, p.name AS product_name
         FROM ishop.orders o
         JOIN ishop.products p ON o.product_id = p.id
         WHERE o.worker_id = ?`,
        [workerId]
    );
    return rows;
};

export const getAllOrdersWithWorker = async () => {
    const [rows] = await db.query(`
        SELECT o.*, w.name AS worker_name
        FROM ishop.orders o
        LEFT JOIN ishop.workers w ON o.worker_id = w.id
    `);
    return rows;
};

// Complete an order
export const completeOrder = async (orderId) => {
    await db.query(
        'UPDATE ishop.orders SET status = "completed", completed_at = NOW() WHERE id = ?',
        [orderId]
    );
    const [[order]] = await db.query('SELECT * FROM ishop.orders WHERE id = ?', [orderId]);
    const [[user]] = await db.query('SELECT email FROM ishop.users WHERE id = ?', [order.user_id]);
    await db.query(
        'UPDATE ishop.products SET stockQuantity = stockQuantity - ? WHERE id = ?',
        [order.quantity, order.product_id]
    );
    return { order, user };
};

export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByWorkerId,
    getAllOrdersWithWorker,
    completeOrder
};