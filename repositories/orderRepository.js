import db from '../models/index.js';
import {logger} from "../logger/logger.js";

const Orders = db.Orders;

const getAllOrders = async (page = 1, limit = 10) => {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    const offset = (page - 1) * limit;

    logger.info(`Getting all orders with pagination. Page: ${page}, Limit: ${limit}`);
    const { count, rows } = await Orders.findAndCountAll({
        offset: offset,
        limit: limit,
        include: [{
            model: db.Products,
            as: 'Product',
            attributes: ['id', 'name', 'price']
        }, {
            model: db.Users,
            as: 'User',
            attributes: ['id', 'username', 'email']
        }]
    });
    logger.info(`Total orders: ${count}, Page: ${page}, Limit: ${limit}`);
    return { items: rows, total: count, page, limit };
};

const getOrderById = async (id) => {
    if (!id) {
        logger.warn('No order ID provided');
        return undefined;
    }
    const order = await Orders.findByPk(id);
    logger.info(`Getting order with ID: ${id}`);
    return order;
};

const createOrder = async ({ userId, status, estimatedArrival, items }) => {
    if (!userId || !status || !estimatedArrival || !Array.isArray(items) || items.length === 0) {
        throw new Error('Invalid order data');
    }
    const results = [];
    for (const item of items) {
        if (!item.productId || !item.quantity) {
            throw new Error('Invalid item data');
        }
        const [result] = await db.query(
            'INSERT INTO ishop.orders (user_id, product_id, quantity, status, estimated_arrival) VALUES (?, ?, ?, ?, ?)',
            [userId, item.productId, item.quantity, status, estimatedArrival]
        );
        results.push(result.insertId);
    }
    return results;
};

const updateOrder = async (id, order) => {
    if (!id || !order) {
        logger.warn('Missing id or order data for update');
        return undefined;
    }
    const { product_id, quantity } = order;
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

const deleteOrder = async (id) => {
    if (!id) {
        logger.warn('No order ID provided for delete');
        return { message: 'Order not found' };
    }
    const count = await Orders.destroy({ where: { id: id } });
    logger.info(`Deleting order with ID: ${id}`);
    return count > 0 ? { message: 'Order deleted successfully' } : { message: 'Order not found' };
};

const getOrdersByWorkerId = async (workerId) => {
    if (!workerId) {
        logger.warn('No worker ID provided');
        return [];
    }
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

export const completeOrder = async (orderId) => {
    if (!orderId) {
        logger.warn('No order ID provided for completion');
        throw new Error('Order not found');
    }
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

export async function assignOrderToWorker(orderId, workerId) {
    if (!orderId || !workerId) {
        logger.warn('Missing orderId or workerId for assignment');
        throw new Error('Order not found');
    }
    const [updated] = await db.Orders.update(
        { worker_id: workerId },
        { where: { id: orderId } }
    );
    if (!updated) {
        logger.warn(`No order found with ID: ${orderId}`);
        throw new Error('Order not found');
    }
    logger.info(`Order ${orderId} assigned to worker ${workerId}`);
}

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