import logger from "../logger/logger.js";
import orderService from "../services/orderService.js";

// The controller for managing orders in the ishop database.
// The purpose of this controller is to handle HTTP requests related to orders.
// The controller layer is responsible for handling HTTP requests, validating input, and calling the service layer to perform business logic.

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
const createOrder = async (req, res) => {
    try {
        const order = req.body;
        logger.info('Creating new order', order);

        if (!order.product_id || !order.quantity) {
            return res.status(400).json({message: 'product ID and quantity are required'});
        }
        const newOrder = await orderService.createOrder(order);
        res.status(201).json(newOrder);
    } catch (error) {
        logger.error('Error creating order', error);
        if (error.errno === 1452){
            return res.status(400).json({message: 'Invalid product ID'});
        }
        res.status(500).json({message: 'Error creating order', error});
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

// Export the controller functions
export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};