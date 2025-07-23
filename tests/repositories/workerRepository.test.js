// tests/repositories/workerRepository.test.js
import { jest } from '@jest/globals';
import workerRepository from '../../repositories/workerRepository.js';

jest.mock('../../models/index.js', () => ({
    Workers: {
        findAll: jest.fn(),
        count: jest.fn()
    },
    Orders: {},
}));
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn()
}));

const db = require('../../models/index.js');
const logger = require('../../logger/logger.js');

describe('workerRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllWorkers', () => {
        it('returns paginated workers and total count', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            db.Workers.count.mockResolvedValue(2);
            const result = await workerRepository.getAllWorkers(1, 2);
            expect(result).toEqual({ workers: [{ id: 1 }, { id: 2 }], total: 2 });
        });

        it('returns empty array and zero total when no workers found', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            db.Workers.count.mockResolvedValue(0);
            const result = await workerRepository.getAllWorkers(1, 2);
            expect(result).toEqual({ workers: [], total: 0 });
        });

        it('handles error from findAll', async () => {
            db.Workers.findAll.mockRejectedValue(new Error('fail'));
            await expect(workerRepository.getAllWorkers(1, 2)).rejects.toThrow('fail');
        });

        it('handles error from count', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1 }]);
            db.Workers.count.mockRejectedValue(new Error('count fail'));
            await expect(workerRepository.getAllWorkers(1, 2)).rejects.toThrow('count fail');
        });

        it('handles zero and negative pagination', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            db.Workers.count.mockResolvedValue(0);
            const resultZero = await workerRepository.getAllWorkers(0, 0);
            expect(resultZero).toEqual({ workers: [], total: 0 });
            const resultNegative = await workerRepository.getAllWorkers(-1, -5);
            expect(resultNegative).toEqual({ workers: [], total: 0 });
        });

        it('handles very large pagination values', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            db.Workers.count.mockResolvedValue(0);
            const result = await workerRepository.getAllWorkers(9999, 9999);
            expect(result).toEqual({ workers: [], total: 0 });
        });

        it('uses default params when none provided', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1 }]);
            db.Workers.count.mockResolvedValue(1);
            const result = await workerRepository.getAllWorkers();
            expect(result).toEqual({ workers: [{ id: 1 }], total: 1 });
        });
    });

    describe('getOrdersByWorkerId', () => {
        it('returns orders for worker', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1, orders: [{ id: 10 }] }]);
            const result = await workerRepository.getOrdersByWorkerId(1, 1, 10);
            expect(result).toEqual([{ id: 1, orders: [{ id: 10 }] }]);
            expect(logger.info).toHaveBeenCalledWith('Getting orders for worker with ID: 1');
        });

        it('returns empty array when workerId does not exist', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            const result = await workerRepository.getOrdersByWorkerId(999, 1, 10);
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalledWith('Getting orders for worker with ID: 999');
        });

        it('handles error from findAll', async () => {
            db.Workers.findAll.mockRejectedValue(new Error('fail'));
            await expect(workerRepository.getOrdersByWorkerId(1, 1, 10)).rejects.toThrow('fail');
        });

        it('handles zero and negative pagination', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            const resultZero = await workerRepository.getOrdersByWorkerId(1, 0, 0);
            expect(resultZero).toEqual([]);
            const resultNegative = await workerRepository.getOrdersByWorkerId(1, -1, -5);
            expect(resultNegative).toEqual([]);
        });

        it('handles very large pagination values', async () => {
            db.Workers.findAll.mockResolvedValue([]);
            const result = await workerRepository.getOrdersByWorkerId(1, 9999, 9999);
            expect(result).toEqual([]);
        });

        it('uses default params when none provided', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1, orders: [] }]);
            const result = await workerRepository.getOrdersByWorkerId(1);
            expect(result).toEqual([{ id: 1, orders: [] }]);
        });

        it('handles missing orders property gracefully', async () => {
            db.Workers.findAll.mockResolvedValue([{ id: 1 }]);
            const result = await workerRepository.getOrdersByWorkerId(1, 1, 10);
            expect(result).toEqual([{ id: 1 }]);
        });
    });
});