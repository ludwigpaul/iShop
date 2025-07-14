// repositories/orderRepository.js
import db from '../models/index.js';
import logger from "../logger/logger.js";

const Orders = db.Orders;

// Get all orders
export const getAllOrders = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const orders = await Orders.findAll({
        offset: offset,
        limit: limit,
        include: [{
            model: db.Products,
            as: 'product',
            attributes: ['id', 'name', 'price']
        }, {
            model: db.Users,
            as: 'user',
            attributes: ['id', 'username', 'email']
        }]
    });
    const total = await Orders.count();
    return { orders, total };
};

// Get an order by ID
const getOrderById = async (id) => {
    const order = await Orders.findByPk(id);
    logger.info(`Getting order with ID: ${id}`);
    return order;
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
    const updatedOrder = await Orders.update(
        { product_id, quantity },
        {
            where: { id: id },
            returning: true,
            plain: true
        }
    );
    logger.info(`Updating order with ID: ${id}`);
    return updatedOrder[1];
};

// Delete an order by ID
const deleteOrder = async (id) => {
    const count = await Orders.destroy({ where: { id: id } });
    logger.info(`Deleting order with ID: ${id}`);
    return count > 0 ? { message: 'Order deleted successfully' } : { message: 'Order not found' };
};

// Get orders by worker ID
const getOrdersByWorkerId = async (workerId) => {
    const order = await Orders.findAll({
        where: { worker_id: workerId },
        include: [{
            model: db.Products,
            as: 'product',
            attributes: ['id', 'name', 'price']
        }, {
            model: db.Users,
            as: 'user',
            attributes: ['id', 'username', 'email']
        }]
    });
    logger.info(`Getting orders for worker with ID: ${workerId}`);
    return order;
};

export const getAllOrdersWithWorker = async () => {
    const ordersWithWorker = await Orders.findAll({
        include: [{
            model: db.Workers,
            as: 'worker',
            attributes: ['id', 'name']
        }, {
            model: db.Products,
            as: 'product',
            attributes: ['id', 'name', 'price']
        }, {
            model: db.Users,
            as: 'user',
            attributes: ['id', 'username', 'email']
        }]
    });
    logger.info(`Getting all orders with worker information. Total orders: ${ordersWithWorker.length}`);
    return ordersWithWorker;
};

// Complete an order
export const completeOrder = async (orderId) => {
    // await db.query(
    //     'UPDATE ishop.orders SET status = "completed", completed_at = NOW() WHERE id = ?',
    //     [orderId]
    // );
    // const [[order]] = await db.query('SELECT * FROM ishop.orders WHERE id = ?', [orderId]);
    // const [[user]] = await db.query('SELECT email FROM ishop.users WHERE id = ?', [order.user_id]);
    // await db.query(
    //     'UPDATE ishop.products SET stockQuantity = stockQuantity - ? WHERE id = ?',
    //     [order.quantity, order.product_id]
    // );

    const updatedOrder = await Orders.update(
        { status: 'completed', completed_at: new Date() },
        { where: { id: orderId }, returning: true, plain: true }
    );
    if (updatedOrder[0] === 0) {
        logger.warn(`No order found with ID: ${orderId}`);
        throw new Error('Order not found');
    }

    const updateStock = await db.Products.update(
        { stockQuantity: db.Sequelize.literal(`stockQuantity - ${updatedOrder[1].quantity}`) },
        { where: { id: updatedOrder[1].product_id } }
    );
    if (updateStock[0] === 0) {
        logger.warn(`No product found with ID: ${updatedOrder[1].product_id}`);
        throw new Error('Product not found');
    }

    const order = await Orders.findByPk(orderId, {
        include: [{
            model: db.Users,
            as: 'user',
            attributes: ['id', 'email']
        }]
    });

    return { order };
};



const assignOrderToWorker = async (orderId, workerId) => {
    const result = Orders.update(
        { worker_id: workerId },
        { where: { id: orderId }, returning: true, plain: true }
    );
    if (result[0] === 0) {
        logger.warn(`No order found with ID: ${orderId}`);
        throw new Error('Order not found');
    }
    logger.info(`Assigning order with ID: ${orderId} to worker with ID: ${workerId}`);
};


export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByWorkerId,
    getAllOrdersWithWorker,
    completeOrder,
    assignOrderToWorker
};