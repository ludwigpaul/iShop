import logger from "../logger/logger.js";
import orderService from "../services/orderService.js";
import nodemailer from 'nodemailer';
import { db } from "../config/dbConfig.js";
import orderRepository from "../repositories/orderRepository.js";

// The controller for managing orders in the ishop database.
// The purpose of this controller is to handle HTTP requests related to orders.
// The controller layer is responsible for handling HTTP requests, validating input, and calling the service layer to perform business logic.

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const getAllOrders = async (req, res) => {
    try {
        logger.info('Getting all orders');
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving orders', error});
    }
}

// Retrieves an order by its ID
const getOrderById = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Getting order with ID: ${id}`);
        const order = await orderService.getOrderById(id);
        if (!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving order', error});
    }
};

// Creates a new order
// controllers/orderController.js
export const createOrder = async (req, res) => {
    try {
        const { userId, items, email } = req.body;
        if (!userId || isNaN(Number(userId))) {
            return res.status(400).json({ error: 'Invalid or missing userId' });
        }

        // Validate user existence
        const [[user]] = await db.query('SELECT id FROM ishop.users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const estimatedArrival = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const orderId = await orderRepository.createOrder({
            userId,
            status: 'pending',
            estimatedArrival,
            items
        });

        res.json({ success: true, orderId: Array.isArray(orderId) ? orderId[0] : orderId });
    } catch (err) {
        res.status(500).json({ error: 'Order creation failed' });
    }
};

// Updates an existing order
const updateOrder = async (req, res) => {
    try {
        const {id} = req.params;
        const order = req.body;
        logger.info(`Updating order with ID: ${id}`, order);

        if (!order.product_id || !order.quantity) {
            return res.status(400).json({message: 'product ID and quantity are required'});
        }
        const updatedOrder = await orderService.updateOrder(id, order);
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error('Error updating order', error);
        res.status(500).json({message: 'Error updating order', error});
    }
};

// Completes an order by ID and sends a notification email to the user
export const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        await db.query(
            'UPDATE ishop.orders SET status = "completed", completed_at = NOW() WHERE id = ?',
            [orderId]
        );

        const [[order]] = await db.query('SELECT user_id FROM ishop.orders WHERE id = ?', [orderId]);
        const [[user]] = await db.query('SELECT email FROM ishop.users WHERE id = ?', [order.user_id]);

        await transporter.sendMail({
            to: user.email,
            subject: 'Order Arrived',
            text: 'Your order has arrived! Thank you for shopping with us.'
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Order completion failed' });
    }
};
// Deletes an order by ID
const deleteOrder = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Deleting order with ID: ${id}`);
        await orderService.deleteOrder(id);
        res.status(204).json({message: 'Order deleted successfully'});
    } catch (error) {
        logger.error('Error deleting order', error);
        res.status(500).json({message: 'Error deleting order', error});
    }
};

// Handles the checkout process for an order
export const checkoutOrder = async (req, res) => {
    // Implement order creation logic here
    res.status(200).json({ orderId: 123 }); // Example response
};

// Export the controller functions
export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    completeOrder,
    checkoutOrder,
    deleteOrder
};