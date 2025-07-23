import { jest } from '@jest/globals';

jest.unstable_mockModule('../../repositories/workerRepository.js', () => ({
    __esModule: true,
    default: {
        getAllWorkers: () => {}
    }
}));
jest.unstable_mockModule('../../repositories/orderRepository.js', () => ({
    __esModule: true,
    default: {
        completeOrder: () => {},
        getOrdersByWorkerId: () => {}
    }
}));

let workerController, workerRepository, orderRepository;

beforeAll(async () => {
    workerController = await import('../../controllers/workerController.js');
    workerRepository = await import('../../repositories/workerRepository.js');
    orderRepository = await import('../../repositories/orderRepository.js');
});

describe('workerController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        workerRepository.default.getAllWorkers = jest.fn();
        orderRepository.default.completeOrder = jest.fn();
        orderRepository.default.getOrdersByWorkerId = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAllWorkers', () => {
        it('should return workers with pagination', async () => {
            workerRepository.default.getAllWorkers.mockResolvedValue({ workers: [{ id: 1 }], total: 1 });
            req.query = { page: '2', limit: '5' };
            await workerController.getAllWorkers(req, res);
            expect(workerRepository.default.getAllWorkers).toHaveBeenCalledWith(2, 5);
            expect(res.json).toHaveBeenCalledWith({ workers: [{ id: 1 }], total: 1, page: 2, limit: 5 });
        });

        it('should use default pagination if not provided', async () => {
            workerRepository.default.getAllWorkers.mockResolvedValue({ workers: [], total: 0 });
            req.query = {};
            await workerController.getAllWorkers(req, res);
            expect(workerRepository.default.getAllWorkers).toHaveBeenCalledWith(1, 10);
            expect(res.json).toHaveBeenCalledWith({ workers: [], total: 0, page: 1, limit: 10 });
        });
    });

    describe('completeWorkerOrder', () => {
        it('should complete worker order', async () => {
            req.params = { workerId: '1', orderId: '10' };
            orderRepository.default.completeOrder.mockResolvedValue();
            await workerController.completeWorkerOrder(req, res);
            expect(orderRepository.default.completeOrder).toHaveBeenCalledWith('10');
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it('should handle error', async () => {
            req.params = { workerId: '1', orderId: '10' };
            orderRepository.default.completeOrder.mockRejectedValue(new Error('fail'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            await workerController.completeWorkerOrder(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to complete order' });
            expect(consoleSpy).toHaveBeenCalledWith('Worker order completion error:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('getWorkerOrders', () => {
        it('should return orders for worker', async () => {
            req.params = { workerId: '2' };
            orderRepository.default.getOrdersByWorkerId.mockResolvedValue([{ id: 1 }]);
            await workerController.getWorkerOrders(req, res);
            expect(orderRepository.default.getOrdersByWorkerId).toHaveBeenCalledWith('2');
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            req.params = { workerId: '2' };
            orderRepository.default.getOrdersByWorkerId.mockRejectedValue(new Error('fail'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            await workerController.getWorkerOrders(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch worker orders' });
            expect(consoleSpy).toHaveBeenCalledWith('Fetch worker orders error:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});