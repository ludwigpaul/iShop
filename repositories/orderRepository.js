import {db} from '../config/dbConfig.js';

// The repository for managing orders in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on orders.

// Function to get all orders
const getAllOrders = async () => {
    const [rows] = await db.query('SELECT * FROM ishop.orders');
    return rows;
};

// Function to get an order by ID
const getOrderById = async (id) => {
    const [rows] = await db.query('SELECT * FROM ishop.orders WHERE id = ?', [id]);
    return rows[0]; // Return the first row if found
};

// Function to create a new order
const createOrder = async ({ userId, status, estimatedArrival, items }) => {
    const results = [];
    for (const item of items) {
        const [result] = await db.query(
            'INSERT INTO ishop.orders (user_id, product_id, quantity, status, estimated_arrival) VALUES (?, ?, ?, ?, ?)',
            [userId, item.productId, item.quantity, status, estimatedArrival]
        );
        results.push(result.insertId);
    }
    return results; // array of order IDs
};

// Function to update an order by ID
const updateOrder = async (id, order) => {
    const {product_id, quantity} = order;
    await db.query('UPDATE ishop.orders SET product_id = ?, quantity = ?  WHERE id = ?', [product_id, quantity, id]);
    return {id, product_id, quantity};
};

// Function to delete an order by ID
const deleteOrder = async (id) => {
    await db.query('DELETE FROM ishop.orders WHERE id = ?', [id]);
    return {message: 'Order deleted successfully'};
};

// Export the repository functions
export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};