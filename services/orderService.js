// services/orderService.js
import orderRepository from "../repositories/orderRepository.js";
import userRepository from "../repositories/userRepository.js";

export const getAllOrders = (page, limit) => orderRepository.getAllOrders(page, limit);

export const getOrderById = (id) => orderRepository.getOrderById(id);

export const createOrder = async ({ userId, items }) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error("User not found");
    return orderRepository.createOrder({ userId, items });
};

export const updateOrder = (id, order) => orderRepository.updateOrder(id, order);

export const completeOrder = async (orderId) => {
    // Mark order as complete and get user info
    return orderRepository.completeOrder(orderId);
};

export const deleteOrder = (id) => orderRepository.deleteOrder(id);

export const getOrdersByWorkerId = (workerId) => orderRepository.getOrdersByWorkerId(workerId);

export const getOrdersByWorker = (workerId, page, limit) => orderRepository.getOrdersByWorker(workerId, page, limit);

export default {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    completeOrder,
    deleteOrder,
    getOrdersByWorkerId,
    getOrdersByWorker
};