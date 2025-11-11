// controllers/orderController.js
import {logger} from "../logger/logger.js";
import orderService from "../services/orderService.js";
import emailService from "../services/emailService.js";

// Retrieves all orders with pagination
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { orders, total } = await orderService.getAllOrders(page, limit);
        res.json({ orders, total, page, limit });
    } catch (error) {
        logger.error('Error retrieving orders', error);
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Getting order with ID: ${id}`);
        const order = await orderService.getOrderById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving order', error });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { userId, items } = req.body;
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ error: 'Invalid or missing userId' });
        }
        const orderId = await orderService.createOrder({ userId, items });
        res.json({ success: true, orderId: Array.isArray(orderId) ? orderId[0] : orderId });
    } catch (err) {
        res.status(500).json({ error: err.message || 'Order creation failed' });
    }
};

export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = req.body;
        logger.info(`Updating order with ID: ${id}`, order);
        if (!order.product_id || !order.quantity) {
            return res.status(400).json({ message: 'product ID and quantity are required' });
        }
        const updatedOrder = await orderService.updateOrder(id, order);
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error('Error updating order', error);
        res.status(500).json({ message: 'Error updating order', error });
    }
};

export const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { order, user } = await orderService.completeOrder(orderId);
        await emailService.sendOrderCompletedEmail(user.email, order.estimated_arrival);
        res.json({ success: true });
    } catch (err) {
        logger.error('Order completion error:', err);
        res.status(500).json({ error: 'Order completion failed', details: err.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Deleting order with ID: ${id}`);
        await orderService.deleteOrder(id);
        res.status(204).json({ message: 'Order deleted successfully' });
    } catch (error) {
        logger.error('Error deleting order', error);
        res.status(500).json({ message: 'Error deleting order', error });
    }
};

export const checkoutOrder = async (req, res) => {
    res.status(200).json({ orderId: 123 });
};

export const getOrdersByWorkerId = async (req, res) => {
    try {
        const { workerId } = req.params;
        logger.info(`Getting orders for worker with ID: ${workerId}`);
        const orders = await orderService.getOrdersByWorkerId(workerId);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this worker' });
        }
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error retrieving worker orders', error);
        res.status(500).json({ message: 'Error retrieving worker orders', error });
    }
};

export const getOrdersByWorker = async (req, res) => {
    try {
        const workerId = req.params.workerId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { orders, total } = await orderService.getOrdersByWorker(workerId, page, limit);
        res.json({ orders, total, page, limit });
    } catch (error) {
        logger.error('Error retrieving orders by worker', error);
        res.status(500).json({ message: 'Error retrieving orders by worker', error });
    }
};

export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    completeOrder,
    checkoutOrder,
    deleteOrder,
    getOrdersByWorkerId,
    getOrdersByWorker
};