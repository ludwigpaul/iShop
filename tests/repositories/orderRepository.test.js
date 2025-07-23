import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/index.js', () => ({
    __esModule: true,
    default: {
        Orders: {
            findAndCountAll: () => {},
            findByPk: () => {},
            create: () => {},
            update: () => {},
            destroy: () => {},
            findAll: () => {}
        },
        Products: {
            update: () => {}
        },
        Users: {
            findByPk: () => {}
        },
        Workers: {},
        Sequelize: {
            Op: {
                or: Symbol('or'),
                like: Symbol('like')
            },
            literal: jest.fn()
        },
        query: () => {}
    }
}));
jest.unstable_mockModule('../../logger/logger.js', () => ({
    __esModule: true,
    default: {
        info: () => {},
        warn: () => {},
        error: () => {}
    }
}));

let orderRepository, completeOrder, assignOrderToWorker, db, logger;

beforeAll(async () => {
    const repo = await import('../../repositories/orderRepository.js');
    orderRepository = repo.default;
    completeOrder = repo.completeOrder;
    assignOrderToWorker = repo.assignOrderToWorker;
    db = (await import('../../models/index.js')).default;
    logger = (await import('../../logger/logger.js')).default;
});

beforeEach(() => {
    db.Orders.findAndCountAll = jest.fn();
    db.Orders.findByPk = jest.fn();
    db.Orders.create = jest.fn();
    db.Orders.update = jest.fn();
    db.Orders.destroy = jest.fn();
    db.Orders.findAll = jest.fn();
    db.Products.update = jest.fn();
    db.Users.findByPk = jest.fn();
    db.query = jest.fn();
    db.Sequelize.literal = jest.fn();

    logger.info = jest.fn();
    logger.warn = jest.fn();
    logger.error = jest.fn();

    jest.clearAllMocks();
});

describe('orderRepository', () => {
    describe('getAllOrders', () => {
        it('should return paginated orders', async () => {
            db.Orders.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });
            const result = await orderRepository.getAllOrders(1, 10);
            expect(result).toEqual({ items: [{ id: 1 }], total: 1, page: 1, limit: 10 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should clamp and parse page/limit', async () => {
            db.Orders.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            await orderRepository.getAllOrders(0, 0);
            expect(db.Orders.findAndCountAll).toHaveBeenCalled();
            await orderRepository.getAllOrders(-5, -10);
            expect(db.Orders.findAndCountAll).toHaveBeenCalled();
            await orderRepository.getAllOrders('abc', 'xyz');
            expect(db.Orders.findAndCountAll).toHaveBeenCalled();
        });
    });

    describe('getOrderById', () => {
        it('should return order by id', async () => {
            db.Orders.findByPk.mockResolvedValue({ id: 1 });
            const result = await orderRepository.getOrderById(1);
            expect(result).toEqual({ id: 1 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if not found', async () => {
            db.Orders.findByPk.mockResolvedValue(undefined);
            const result = await orderRepository.getOrderById(999);
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });

        it('should warn and return undefined if id missing', async () => {
            const result = await orderRepository.getOrderById();
            expect(result).toBeUndefined();
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('createOrder', () => {
        it('should create orders for items', async () => {
            db.query.mockResolvedValue([{ insertId: 42 }]);
            const result = await orderRepository.createOrder({
                userId: 1,
                status: 'pending',
                estimatedArrival: '2024-06-01',
                items: [{ productId: 2, quantity: 3 }]
            });
            expect(result).toEqual([42]);
        });
        it('should create multiple orders for multiple items', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 1 }]).mockResolvedValueOnce([{ insertId: 2 }]);
            const result = await orderRepository.createOrder({
                userId: 1,
                status: 'pending',
                estimatedArrival: '2024-06-01',
                items: [
                    { productId: 2, quantity: 3 },
                    { productId: 3, quantity: 1 }
                ]
            });
            expect(result).toEqual([1, 2]);
        });
        it('should throw if order data is invalid', async () => {
            await expect(orderRepository.createOrder({})).rejects.toThrow('Invalid order data');
            await expect(orderRepository.createOrder({ userId: 1, status: 'pending', estimatedArrival: '2024-06-01', items: [] })).rejects.toThrow('Invalid order data');
            await expect(orderRepository.createOrder({ userId: 1, status: 'pending', estimatedArrival: '2024-06-01', items: [{ productId: 2 }] })).rejects.toThrow('Invalid item data');
        });
    });

    describe('updateOrder', () => {
        it('should update an order', async () => {
            db.Orders.update.mockResolvedValue([1, { id: 1, product_id: 2, quantity: 3 }]);
            const result = await orderRepository.updateOrder(1, { product_id: 2, quantity: 3 });
            expect(result).toEqual({ id: 1, product_id: 2, quantity: 3 });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return undefined if update result is missing', async () => {
            db.Orders.update.mockResolvedValue([1, undefined]);
            const result = await orderRepository.updateOrder(1, { product_id: 2, quantity: 3 });
            expect(result).toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should warn and return undefined if id or order missing', async () => {
            const result = await orderRepository.updateOrder();
            expect(result).toBeUndefined();
            expect(logger.warn).toHaveBeenCalled();
            const result2 = await orderRepository.updateOrder(1);
            expect(result2).toBeUndefined();
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order and return success message', async () => {
            db.Orders.destroy.mockResolvedValue(1);
            const result = await orderRepository.deleteOrder(1);
            expect(result).toEqual({ message: 'Order deleted successfully' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return not found message if nothing deleted', async () => {
            db.Orders.destroy.mockResolvedValue(0);
            const result = await orderRepository.deleteOrder(2);
            expect(result).toEqual({ message: 'Order not found' });
            expect(logger.info).toHaveBeenCalled();
        });
        it('should warn and return not found if id missing', async () => {
            const result = await orderRepository.deleteOrder();
            expect(result).toEqual({ message: 'Order not found' });
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('getOrdersByWorkerId', () => {
        it('should return orders for worker', async () => {
            db.Orders.findAll.mockResolvedValue([{ id: 1 }]);
            const result = await orderRepository.getOrdersByWorkerId(1);
            expect(result).toEqual([{ id: 1 }]);
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return empty array if no orders', async () => {
            db.Orders.findAll.mockResolvedValue([]);
            const result = await orderRepository.getOrdersByWorkerId(1);
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalled();
        });
        it('should warn and return empty array if workerId missing', async () => {
            const result = await orderRepository.getOrdersByWorkerId();
            expect(result).toEqual([]);
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('getAllOrdersWithWorker', () => {
        it('should return all orders with worker info', async () => {
            db.Orders.findAll.mockResolvedValue([{ id: 1 }]);
            const result = await orderRepository.getAllOrdersWithWorker();
            expect(result).toEqual([{ id: 1 }]);
            expect(logger.info).toHaveBeenCalled();
        });
        it('should return empty array if no orders', async () => {
            db.Orders.findAll.mockResolvedValue([]);
            const result = await orderRepository.getAllOrdersWithWorker();
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('completeOrder', () => {
        it('should complete an order and update stock', async () => {
            db.Orders.update.mockResolvedValue([1, { id: 1, quantity: 2, product_id: 3 }]);
            db.Products.update.mockResolvedValue([1]);
            db.Orders.findByPk.mockResolvedValue({ id: 1, user: { id: 1, email: 'test@test.com' } });
            const result = await completeOrder(1);
            expect(result).toEqual({ order: { id: 1, user: { id: 1, email: 'test@test.com' } } });
        });
        it('should throw error if order not found', async () => {
            db.Orders.update.mockResolvedValue([0]);
            await expect(completeOrder(99)).rejects.toThrow('Order not found');
            expect(logger.warn).toHaveBeenCalled();
        });
        it('should throw error if product not found', async () => {
            db.Orders.update.mockResolvedValue([1, { id: 1, quantity: 2, product_id: 3 }]);
            db.Products.update.mockResolvedValue([0]);
            await expect(completeOrder(1)).rejects.toThrow('Product not found');
            expect(logger.warn).toHaveBeenCalled();
        });
        it('should throw error if orderId missing', async () => {
            await expect(completeOrder()).rejects.toThrow('Order not found');
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('assignOrderToWorker', () => {
        it('should assign order to worker', async () => {
            db.Orders.update.mockResolvedValue([1]);
            await expect(assignOrderToWorker(1, 2)).resolves.toBeUndefined();
            expect(logger.info).toHaveBeenCalled();
        });
        it('should throw error if order not found', async () => {
            db.Orders.update.mockResolvedValue([0]);
            await expect(assignOrderToWorker(99, 2)).rejects.toThrow('Order not found');
            expect(logger.warn).toHaveBeenCalled();
        });
        it('should throw error if orderId or workerId missing', async () => {
            await expect(assignOrderToWorker()).rejects.toThrow('Order not found');
            expect(logger.warn).toHaveBeenCalled();
            await expect(assignOrderToWorker(1)).rejects.toThrow('Order not found');
            expect(logger.warn).toHaveBeenCalled();
        });
    });
});