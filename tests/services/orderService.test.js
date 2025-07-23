import { jest } from '@jest/globals'; // Import jest first

jest.mock('../../repositories/orderRepository.js', () => ({
    getAllOrders: jest.fn(),
    getOrderById: jest.fn(),
    createOrder: jest.fn(),
    updateOrder: jest.fn(),
    completeOrder: jest.fn(),
    deleteOrder: jest.fn(),
    getOrdersByWorkerId: jest.fn(),
    getOrdersByWorker: jest.fn()
}));
jest.mock('../../repositories/userRepository.js', () => ({
    getUserById: jest.fn()
}));

import orderService from '../../services/orderService.js';
import orderRepository from '../../repositories/orderRepository.js';
import userRepository from '../../repositories/userRepository.js';

describe('Order Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getAllOrders should return all orders', async () => {
        orderRepository.getAllOrders.mockResolvedValue(['order1', 'order2']);
        const result = await orderService.getAllOrders(1, 10);
        expect(orderRepository.getAllOrders).toHaveBeenCalledWith(1, 10);
        expect(result).toEqual(['order1', 'order2']);
    });

    it('getOrderById should return order by id', async () => {
        orderRepository.getOrderById.mockResolvedValue({ id: 1, items: [] });
        const result = await orderService.getOrderById(1);
        expect(orderRepository.getOrderById).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1, items: [] });
    });

    it('createOrder should create order if user exists', async () => {
        userRepository.getUserById.mockResolvedValue({ id: 1 });
        orderRepository.createOrder.mockResolvedValue({ id: 2, items: ['item'] });
        const result = await orderService.createOrder({ userId: 1, items: ['item'] });
        expect(userRepository.getUserById).toHaveBeenCalledWith(1);
        expect(orderRepository.createOrder).toHaveBeenCalledWith({ userId: 1, items: ['item'] });
        expect(result).toEqual({ id: 2, items: ['item'] });
    });

    it('createOrder should throw error if user does not exist', async () => {
        userRepository.getUserById.mockResolvedValue(null);
        await expect(orderService.createOrder({ userId: 99, items: [] }))
            .rejects.toThrow('User not found');
        expect(userRepository.getUserById).toHaveBeenCalledWith(99);
        expect(orderRepository.createOrder).not.toHaveBeenCalled();
    });

    it('updateOrder should update order', async () => {
        orderRepository.updateOrder.mockResolvedValue({ id: 1, items: ['updated'] });
        const result = await orderService.updateOrder(1, { items: ['updated'] });
        expect(orderRepository.updateOrder).toHaveBeenCalledWith(1, { items: ['updated'] });
        expect(result).toEqual({ id: 1, items: ['updated'] });
    });

    it('completeOrder should complete order', async () => {
        orderRepository.completeOrder.mockResolvedValue({ id: 1, status: 'COMPLETE' });
        const result = await orderService.completeOrder(1);
        expect(orderRepository.completeOrder).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1, status: 'COMPLETE' });
    });

    it('deleteOrder should delete order', async () => {
        orderRepository.deleteOrder.mockResolvedValue(true);
        const result = await orderService.deleteOrder(1);
        expect(orderRepository.deleteOrder).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });

    it('getOrdersByWorkerId should return orders by workerId', async () => {
        orderRepository.getOrdersByWorkerId.mockResolvedValue(['orderA']);
        const result = await orderService.getOrdersByWorkerId(5);
        expect(orderRepository.getOrdersByWorkerId).toHaveBeenCalledWith(5);
        expect(result).toEqual(['orderA']);
    });

    it('getOrdersByWorker should return paginated orders by worker', async () => {
        orderRepository.getOrdersByWorker.mockResolvedValue(['orderB']);
        const result = await orderService.getOrdersByWorker(5, 2, 20);
        expect(orderRepository.getOrdersByWorker).toHaveBeenCalledWith(5, 2, 20);
        expect(result).toEqual(['orderB']);
    });
});