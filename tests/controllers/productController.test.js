import * as productService from '../../services/productService.js';
import * as productController from '../../controllers/productController.js';
import { jest } from '@jest/globals';

jest.mock('../../services/productService.js');

describe('productController', () => {
    let req, res;

    beforeEach(() => {
        req = { params: {}, body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        productService.getAllProducts.mockClear();
        productService.getProductById.mockClear();
        productService.getProductsWithCategory.mockClear();
        productService.createProduct.mockClear();
        productService.updateProduct && productService.updateProduct.mockClear();
        productService.deleteProduct && productService.deleteProduct.mockClear();
        productService.findProducts && productService.findProducts.mockClear();
    });

    describe('getAllProducts', () => {
        it('should return products', async () => {
            productService.getAllProducts.mockResolvedValue([{ id: 1 }]);
            req.query = { page: '1', limit: '10' };
            await productController.getAllProducts(req, res);
            expect(res.json).toHaveBeenCalledWith({ products: [{ id: 1 }] });
        });

        it('should handle error', async () => {
            productService.getAllProducts.mockRejectedValue(new Error('fail'));
            await productController.getAllProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('getProductById', () => {
        it('should return product', async () => {
            productService.getProductById.mockResolvedValue({ id: 1 });
            req.params = { id: 1 };
            await productController.getProductById(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 404 if not found', async () => {
            productService.getProductById.mockResolvedValue(null);
            req.params = { id: 1 };
            await productController.getProductById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        it('should handle error', async () => {
            productService.getProductById.mockRejectedValue(new Error('fail'));
            req.params = { id: 1 };
            await productController.getProductById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('getProductsWithCategory', () => {
        it('should return products with category', async () => {
            productService.getProductsWithCategory.mockResolvedValue([{ id: 1 }]);
            req.query = { category: 'test' };
            await productController.getProductsWithCategory(req, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            productService.getProductsWithCategory.mockRejectedValue(new Error('fail'));
            req.query = { category: 'test' };
            await productController.getProductsWithCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('createProduct', () => {
        it('should create product', async () => {
            productService.createProduct.mockResolvedValue({ id: 1 });
            req.body = { name: 'Test' };
            await productController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should handle error', async () => {
            productService.createProduct.mockRejectedValue(new Error('fail'));
            req.body = { name: 'Test' };
            await productController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('updateProduct', () => {
        it('should update product', async () => {
            productService.updateProduct.mockResolvedValue({ id: 1 });
            req.params = { id: 1 };
            req.body = { name: 'Updated' };
            await productController.updateProduct(req, res);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should handle error', async () => {
            productService.updateProduct.mockRejectedValue(new Error('fail'));
            req.params = { id: 1 };
            req.body = { name: 'Updated' };
            await productController.updateProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('deleteProduct', () => {
        it('should delete product', async () => {
            productService.deleteProduct.mockResolvedValue(true);
            req.params = { id: 1 };
            await productController.deleteProduct(req, res);
            expect(res.send).toHaveBeenCalledWith({ success: true });
        });

        it('should handle error', async () => {
            productService.deleteProduct.mockRejectedValue(new Error('fail'));
            req.params = { id: 1 };
            await productController.deleteProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });

    describe('findProducts', () => {
        it('should find products', async () => {
            req.query = { searchTerm: 'Test' };
            productService.findProducts.mockResolvedValue([{ id: 1 }]);
            await productController.findProducts(req, res);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            req.query = { searchTerm: 'Test' };
            productService.findProducts.mockRejectedValue(new Error('fail'));
            await productController.findProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
        });
    });
});