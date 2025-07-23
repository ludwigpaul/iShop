import { jest } from '@jest/globals';

import productRepository from '../../repositories/productRepository.js';

jest.mock('../../models/index.js', () => ({
    Products: {
        findAndCountAll: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn()
    },
    Categories: {},
    Sequelize: {
        Op: {
            or: Symbol('or'),
            like: Symbol('like')
        }
    }
}));
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

const db = require('../../models/index.js');
const logger = require('../../logger/logger.js');

describe('productRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return paginated products', async () => {
            db.Products.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 1 }, { id: 2 }] });
            const result = await productRepository.getAllProducts(1, 2);
            expect(result).toEqual({ items: [{ id: 1 }, { id: 2 }], total: 2, page: 1, limit: 2 });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should clamp and parse page/limit', async () => {
            db.Products.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            await productRepository.getAllProducts(0, 0);
            expect(db.Products.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: 0,
                limit: 10, // default limit
                include: expect.any(Array)
            }));
            await productRepository.getAllProducts(-5, -10);
            expect(db.Products.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: 0,
                limit: 1,
                include: expect.any(Array)
            }));
            await productRepository.getAllProducts('abc', 'xyz');
            expect(db.Products.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: 0,
                limit: 10,
                include: expect.any(Array)
            }));
        });
    });

    describe('getProductsWithCategory', () => {
        it('should return products with category', async () => {
            db.Products.findAll.mockResolvedValue([{ id: 1, category: { id: 1, name: 'Cat' } }]);
            const result = await productRepository.getProductsWithCategory();
            expect(result).toEqual([{ id: 1, category: { id: 1, name: 'Cat' } }]);
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('getProductById', () => {
        it('should return product by id', async () => {
            db.Products.findByPk.mockResolvedValue({ id: 1 });
            const result = await productRepository.getProductById(1);
            expect(result).toEqual({ id: 1 });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should warn and return undefined if id missing', async () => {
            const result = await productRepository.getProductById();
            expect(result).toBeUndefined();
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('createProduct', () => {
        it('should create a new product', async () => {
            db.Products.create.mockResolvedValue({ id: 3, name: 'Test' });
            const result = await productRepository.createProduct({ name: 'Test' });
            expect(result).toEqual({ id: 3, name: 'Test' });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('updateProduct', () => {
        it('should update a product', async () => {
            db.Products.update.mockResolvedValue([1, { id: 4, name: 'Updated' }]);
            const result = await productRepository.updateProduct(4, { name: 'Updated' });
            expect(result).toEqual({ id: 4, name: 'Updated' });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product and return success message', async () => {
            db.Products.destroy.mockResolvedValue(1);
            const result = await productRepository.deleteProduct(5);
            expect(result).toEqual({ message: 'Product deleted successfully' });
            expect(logger.info).toHaveBeenCalled();
        });

        it('should return not found message if nothing deleted', async () => {
            db.Products.destroy.mockResolvedValue(0);
            const result = await productRepository.deleteProduct(6);
            expect(result).toEqual({ message: 'Product not found' });
            expect(logger.info).toHaveBeenCalled();
        });
    });

    describe('findProducts', () => {
        it('should find products by search term', async () => {
            db.Products.findAll.mockResolvedValue([{ id: 7, name: 'Search' }]);
            const result = await productRepository.findProducts('Search');
            expect(result).toEqual([{ id: 7, name: 'Search' }]);
            expect(logger.info).toHaveBeenCalled();
            expect(db.Products.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.any(Object)
            }));
        });

        it('should handle empty search term', async () => {
            db.Products.findAll.mockResolvedValue([]);
            const result = await productRepository.findProducts('');
            expect(result).toEqual([]);
            expect(logger.info).toHaveBeenCalled();
        });
    });
});