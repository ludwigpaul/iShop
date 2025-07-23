import { jest } from '@jest/globals';

jest.mock('../../repositories/productRepository.js', () => ({
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    getProductsWithCategory: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    findProducts: jest.fn()
}));

import productService from '../../services/productService.js';
import productRepository from '../../repositories/productRepository.js';

describe('Product Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllProducts', () => {
        it('should return all products', async () => {
            productRepository.getAllProducts.mockResolvedValue(['prod1', 'prod2']);
            const result = await productService.getAllProducts(1, 10);
            expect(productRepository.getAllProducts).toHaveBeenCalledWith(1, 10);
            expect(result).toEqual(['prod1', 'prod2']);
        });

        it('should default page and limit if not provided', async () => {
            productRepository.getAllProducts.mockResolvedValue(['prod1']);
            await productService.getAllProducts();
            expect(productRepository.getAllProducts).toHaveBeenCalledWith(1, 10);
        });

        it('should clamp page and limit to at least 1', async () => {
            productRepository.getAllProducts.mockResolvedValue(['prod1']);
            await productService.getAllProducts(0, 0);
            expect(productRepository.getAllProducts).toHaveBeenCalledWith(1, 10); // limit defaults to 10
            await productService.getAllProducts(-5, -10);
            expect(productRepository.getAllProducts).toHaveBeenCalledWith(1, 1); // negative limit clamps to 1
        });

        it('should parse non-numeric page and limit', async () => {
            productRepository.getAllProducts.mockResolvedValue(['prod1']);
            await productService.getAllProducts('abc', 'xyz');
            expect(productRepository.getAllProducts).toHaveBeenCalledWith(1, 10);
        });

        it('should throw on repository error', async () => {
            productRepository.getAllProducts.mockRejectedValue(new Error('fail'));
            await expect(productService.getAllProducts(1, 10)).rejects.toThrow('fail');
        });
    });

    it('getProductById should return product by id', async () => {
        productRepository.getProductById.mockResolvedValue({ id: 1, name: 'Phone' });
        const result = await productService.getProductById(1);
        expect(productRepository.getProductById).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1, name: 'Phone' });
    });

    it('getProductById should throw if id is missing', async () => {
        await expect(productService.getProductById()).rejects.toThrow('Product ID is required');
    });

    it('getProductById should throw on repository error', async () => {
        productRepository.getProductById.mockRejectedValue(new Error('fail'));
        await expect(productService.getProductById(1)).rejects.toThrow('fail');
    });

    it('getProductsWithCategory should return products with category', async () => {
        productRepository.getProductsWithCategory.mockResolvedValue([{ id: 2, name: 'Book', category: 'Books' }]);
        const result = await productService.getProductsWithCategory();
        expect(productRepository.getProductsWithCategory).toHaveBeenCalled();
        expect(result).toEqual([{ id: 2, name: 'Book', category: 'Books' }]);
    });

    it('getProductsWithCategory should throw on repository error', async () => {
        productRepository.getProductsWithCategory.mockRejectedValue(new Error('fail'));
        await expect(productService.getProductsWithCategory()).rejects.toThrow('fail');
    });

    it('createProduct should create a product', async () => {
        productRepository.createProduct.mockResolvedValue({ id: 3, name: 'Tablet' });
        const result = await productService.createProduct({ name: 'Tablet' });
        expect(productRepository.createProduct).toHaveBeenCalledWith({ name: 'Tablet' });
        expect(result).toEqual({ id: 3, name: 'Tablet' });
    });

    it('createProduct should throw if product is missing', async () => {
        await expect(productService.createProduct()).rejects.toThrow('Product data is required');
    });

    it('createProduct should throw if product is not an object', async () => {
        await expect(productService.createProduct('not-an-object')).rejects.toThrow('Product data is required');
    });

    it('createProduct should throw on repository error', async () => {
        productRepository.createProduct.mockRejectedValue(new Error('fail'));
        await expect(productService.createProduct({ name: 'Tablet' })).rejects.toThrow('fail');
    });

    it('updateProduct should update a product', async () => {
        productRepository.updateProduct.mockResolvedValue({ id: 1, name: 'Updated Phone' });
        const result = await productService.updateProduct(1, { name: 'Updated Phone' });
        expect(productRepository.updateProduct).toHaveBeenCalledWith(1, { name: 'Updated Phone' });
        expect(result).toEqual({ id: 1, name: 'Updated Phone' });
    });

    it('updateProduct should throw if id is missing', async () => {
        await expect(productService.updateProduct(undefined, { name: 'x' })).rejects.toThrow('Product ID is required');
    });

    it('updateProduct should throw if product is missing', async () => {
        await expect(productService.updateProduct(1)).rejects.toThrow('Product data is required');
    });

    it('updateProduct should throw if product is not an object', async () => {
        await expect(productService.updateProduct(1, 'not-an-object')).rejects.toThrow('Product data is required');
    });

    it('updateProduct should throw on repository error', async () => {
        productRepository.updateProduct.mockRejectedValue(new Error('fail'));
        await expect(productService.updateProduct(1, { name: 'x' })).rejects.toThrow('fail');
    });

    it('deleteProduct should delete a product', async () => {
        productRepository.deleteProduct.mockResolvedValue(true);
        const result = await productService.deleteProduct(1);
        expect(productRepository.deleteProduct).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });

    it('deleteProduct should throw if id is missing', async () => {
        await expect(productService.deleteProduct()).rejects.toThrow('Product ID is required');
    });

    it('deleteProduct should throw on repository error', async () => {
        productRepository.deleteProduct.mockRejectedValue(new Error('fail'));
        await expect(productService.deleteProduct(1)).rejects.toThrow('fail');
    });

    it('findProducts should find products by search term', async () => {
        productRepository.findProducts.mockResolvedValue([{ id: 4, name: 'Garden Tool' }]);
        const result = await productService.findProducts('Garden');
        expect(productRepository.findProducts).toHaveBeenCalledWith('Garden');
        expect(result).toEqual([{ id: 4, name: 'Garden Tool' }]);
    });

    it('findProducts should throw if searchTerm is missing', async () => {
        await expect(productService.findProducts()).rejects.toThrow('Search term is required');
    });

    it('findProducts should throw on repository error', async () => {
        productRepository.findProducts.mockRejectedValue(new Error('fail'));
        await expect(productService.findProducts('Garden')).rejects.toThrow('fail');
    });
});