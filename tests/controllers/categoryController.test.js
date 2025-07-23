import categoryController from '../../controllers/categoryController.js';
import categoryService from '../../services/categoryService.js';
import logger from '../../logger/logger.js';
import { jest } from '@jest/globals';

jest.mock('../../services/categoryService.js');
jest.mock('../../logger/logger.js');

describe('categoryController', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, query: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllCategories', () => {
        it('should return categories', async () => {
            categoryService.getAllCategories.mockResolvedValue([{ id: 1 }]);
            await categoryController.getAllCategories(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should handle error', async () => {
            categoryService.getAllCategories.mockRejectedValue(new Error('fail'));
            await categoryController.getAllCategories(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving categories' }));
        });
    });

    describe('getCategoryById', () => {
        it('should return category', async () => {
            req.params = { id: 1 };
            categoryService.getCategoryById.mockResolvedValue({ id: 1 });
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 404 if not found', async () => {
            req.params = { id: 1 };
            categoryService.getCategoryById.mockResolvedValue(null);
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            categoryService.getCategoryById.mockRejectedValue(new Error('fail'));
            await categoryController.getCategoryById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error retrieving category' }));
        });
    });

    describe('createCategory', () => {
        it('should create category', async () => {
            req.body = { name: 'Test', description: 'Desc' };
            categoryService.createCategory.mockResolvedValue({ id: 1 });
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return 400 if missing fields', async () => {
            req.body = {};
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Name and description are required' });
        });

        it('should return 409 if category exists', async () => {
            req.body = { name: 'Test', description: 'Desc' };
            const error = { errno: 1062 };
            categoryService.createCategory.mockRejectedValue(error);
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Category already exists' });
        });

        it('should handle error', async () => {
            req.body = { name: 'Test', description: 'Desc' };
            categoryService.createCategory.mockRejectedValue(new Error('fail'));
            await categoryController.createCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error creating category' }));
        });
    });

    describe('updateCategory', () => {
        it('should update category', async () => {
            req.params = { id: 1 };
            req.body = { name: 'Updated' };
            categoryService.updateCategory.mockResolvedValue({ id: 1, name: 'Updated' });
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated' });
        });

        it('should return 400 if missing fields', async () => {
            req.body = {};
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('required') }));
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            req.body = { name: 'Updated' };
            categoryService.updateCategory.mockRejectedValue(new Error('fail'));
            await categoryController.updateCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error updating category' }));
        });
    });

    describe('deleteCategory', () => {
        it('should delete category', async () => {
            req.params = { id: 1 };
            categoryService.deleteCategory.mockResolvedValue();
            await categoryController.deleteCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle error', async () => {
            req.params = { id: 1 };
            categoryService.deleteCategory.mockRejectedValue(new Error('fail'));
            await categoryController.deleteCategory(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error deleting category' }));
        });
    });

    describe('findCategories', () => {
        it('should find categories', async () => {
            req.query = { searchTerm: 'Test' };
            categoryService.findCategories.mockResolvedValue([{ id: 1 }]);
            await categoryController.findCategories(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
        });

        it('should return 400 if missing searchTerm', async () => {
            req.query = {};
            await categoryController.findCategories(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Search term is required' });
        });

        it('should handle error', async () => {
            req.query = { searchTerm: 'Test' };
            categoryService.findCategories.mockRejectedValue(new Error('fail'));
            await categoryController.findCategories(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error finding categories' }));
        });
    });
});