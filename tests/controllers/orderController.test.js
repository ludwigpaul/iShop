import orderController from '../../controllers/orderController.js';
import orderService from '../../services/orderService.js';
import emailService from '../../services/emailService.js';
import logger from '../../logger/logger.js';
import { jest } from '@jest/globals';

jest.mock('../../services/orderService.js');
jest.mock('../../services/emailService.js');
jest.mock('../../logger/logger.js');

describe('orderController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        orderService.getAllOrders = jest.fn();
        orderService.getOrderById = jest.fn();
        orderService.createOrder = jest.fn();
        orderService.updateOrder = jest.fn();
        orderService.completeOrder = jest.fn();
        orderService.deleteOrder = jest.fn();
        orderService.getOrdersByWorkerId = jest.fn();
        orderService.getOrdersByWorker = jest.fn();
        emailService.sendOrderCompletedEmail = jest.fn();
        logger.error = jest.fn();
        logger.info = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAllOrders', () => {
        it('should return orders', async () => {
            orderService.getAllOrders.mockResolvedValue({ orders: [{ id: 1 }], total: 1 });
            req.query = { page: '1', limit: '10' };
            await orderController.getAllOrders(req, res);
            expect(res.json).toHaveBeenCalledWith({ orders: [{ id: 1 }], total: 1, page: 1, limit: 10 });
        });

        it('should handle error', async () => {
            orderService.getAllOrders.mockRejectedValue(new Error('fail'));
            await orderController.getAllOrders(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving orders' }));
        });
    });

    describe('getOrderById', () => {
        it('should return order', async () => {
            req.params = { id: 1 };
            orderService.getOrderById.mockResolvedValue({ id: 1 });
            await orderController.getOrderById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 404 if not found', async () => {
            req.params = { id: 1 };
            orderService.getOrderById.mockResolvedValue(null);
            await orderController.getOrderById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            orderService.getOrderById.mockRejectedValue(new Error('fail'));
            await orderController.getOrderById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving order' }));
        });
    });

    describe('createOrder', () => {
        it('should create order', async () => {
            req.body = { userId: 1, items: [{ product_id: 1, quantity: 2 }] };
            orderService.createOrder.mockResolvedValue(123);
            await orderController.createOrder(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, orderId: 123 });
        });

        it('should return 400 if missing userId', async () => {
            req.body = { items: [] };
            await orderController.createOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or missing userId' });
        });

        it('should handle error', async () => {
            req.body = { userId: 1, items: [] };
            orderService.createOrder.mockRejectedValue(new Error('fail'));
            await orderController.createOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('updateOrder', () => {
        it('should update order', async () => {
            req.params = { id: 1 };
            req.body = { product_id: 1, quantity: 2 };
            orderService.updateOrder.mockResolvedValue({ id: 1, product_id: 1, quantity: 2 });
            await orderController.updateOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, product_id: 1, quantity: 2 });
        });

        it('should return 400 if missing fields', async () => {
            req.body = {};
            await orderController.updateOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'product ID and quantity are required' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            req.body = { product_id: 1, quantity: 2 };
            orderService.updateOrder.mockRejectedValue(new Error('fail'));
            await orderController.updateOrder(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error updating order' }));
        });

        it('should return 400 if missing product_id', async () => {
            req.body = { quantity: 2 };
            await orderController.updateOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'product ID and quantity are required' });
        });

        it('should return 400 if missing quantity', async () => {
            req.body = { product_id: 1 };
            await orderController.updateOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'product ID and quantity are required' });
        });
    });

    describe('completeOrder', () => {
        it('should complete order and send email', async () => {
            req.params = { orderId: 1 };
            orderService.completeOrder.mockResolvedValue({
                order: { estimated_arrival: '2024-06-01' },
                user: { email: 'test@test.com' }
            });
            emailService.sendOrderCompletedEmail.mockResolvedValue();
            await orderController.completeOrder(req, res);
            expect(emailService.sendOrderCompletedEmail).toHaveBeenCalledWith('test@test.com', '2024-06-01');
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it('should handle error', async () => {
            req.params = { orderId: 1 };
            orderService.completeOrder.mockRejectedValue(new Error('fail'));
            await orderController.completeOrder(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Order completion failed', details: 'fail' });
        });
    });

    describe('deleteOrder', () => {
        it('should delete order', async () => {
            req.params = { id: 1 };
            orderService.deleteOrder.mockResolvedValue();
            await orderController.deleteOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            orderService.deleteOrder.mockRejectedValue(new Error('fail'));
            await orderController.deleteOrder(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error deleting order' }));
        });
    });

    describe('checkoutOrder', () => {
        it('should return orderId', async () => {
            await orderController.checkoutOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ orderId: 123 });
        });
    });

    describe('getOrdersByWorkerId', () => {
        it('should return orders for worker', async () => {
            req.params = { workerId: 2 };
            orderService.getOrdersByWorkerId.mockResolvedValue([{ id: 1 }]);
            await orderController.getOrdersByWorkerId(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should return 404 if no orders found', async () => {
            req.params = { workerId: 2 };
            orderService.getOrdersByWorkerId.mockResolvedValue([]);
            await orderController.getOrdersByWorkerId(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'No orders found for this worker' });
        });

        it('should handle error', async () => {
            req.params = { workerId: 2 };
            orderService.getOrdersByWorkerId.mockRejectedValue(new Error('fail'));
            await orderController.getOrdersByWorkerId(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving worker orders' }));
        });
    });

    describe('getOrdersByWorker', () => {
        it('should return paginated orders for worker', async () => {
            req.params = { workerId: 2 };
            req.query = { page: '1', limit: '10' };
            orderService.getOrdersByWorker.mockResolvedValue({ orders: [{ id: 1 }], total: 1 });
            await orderController.getOrdersByWorker(req, res);
            expect(res.json).toHaveBeenCalledWith({ orders: [{ id: 1 }], total: 1, page: 1, limit: 10 });
        });

        it('should handle error', async () => {
            req.params = { workerId: 2 };
            orderService.getOrdersByWorker.mockRejectedValue(new Error('fail'));
            await orderController.getOrdersByWorker(req, res);
            expect(logger.error).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving orders by worker' }));
        });
    });
});