import orderRepository from "../repositories/orderRepository.js";

// The service for managing orders in the ishop database.
// The purpose of this service is to provide functions for CRUD operations on orders.

const getAllOrders = async () => {
    return await orderRepository.getAllOrders();
}

const getOrderById = async (id) => {
    return await orderRepository.getOrderById(id);
}

const createOrder = async (order) => {
    return await orderRepository.createOrder(order);
}

const updateOrder = async (id, order) => {
    return await orderRepository.updateOrder(id, order);
}

const deleteOrder = async (id) => {
    return await orderRepository.deleteOrder(id);
}


export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};