import categoryService from '../../services/categoryService.js';
import { jest } from '@jest/globals';

jest.mock('../../repositories/categoryRepository.js');

import categoryRepository from '../../repositories/categoryRepository.js';

describe('Category Service', () => {
    beforeEach(() => {
        categoryRepository.getAllCategories = jest.fn();
        categoryRepository.getCategoryById = jest.fn();
        categoryRepository.createCategory = jest.fn();
        categoryRepository.updateCategory = jest.fn();
        categoryRepository.deleteCategory = jest.fn();
        categoryRepository.findCategories = jest.fn();
        jest.clearAllMocks();
    });

    it('getAllCategories should return all categories', async () => {
        categoryRepository.getAllCategories.mockResolvedValue(['cat1', 'cat2']);
        const result = await categoryService.getAllCategories();
        expect(categoryRepository.getAllCategories).toHaveBeenCalled();
        expect(result).toEqual(['cat1', 'cat2']);
    });

    it('getCategoryById should return category by id', async () => {
        categoryRepository.getCategoryById.mockResolvedValue({ id: 1, name: 'Electronics' });
        const result = await categoryService.getCategoryById(1);
        expect(categoryRepository.getCategoryById).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1, name: 'Electronics' });
    });

    it('createCategory should create a category', async () => {
        categoryRepository.createCategory.mockResolvedValue({ id: 2, name: 'Books' });
        const result = await categoryService.createCategory({ name: 'Books' });
        expect(categoryRepository.createCategory).toHaveBeenCalledWith({ name: 'Books' });
        expect(result).toEqual({ id: 2, name: 'Books' });
    });

    it('updateCategory should update a category', async () => {
        categoryRepository.updateCategory.mockResolvedValue({ id: 1, name: 'Updated' });
        const result = await categoryService.updateCategory(1, { name: 'Updated' });
        expect(categoryRepository.updateCategory).toHaveBeenCalledWith(1, { name: 'Updated' });
        expect(result).toEqual({ id: 1, name: 'Updated' });
    });

    it('deleteCategory should delete a category', async () => {
        categoryRepository.deleteCategory.mockResolvedValue(true);
        const result = await categoryService.deleteCategory(1);
        expect(categoryRepository.deleteCategory).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
    });

    it('findCategories should find categories by search term', async () => {
        categoryRepository.findCategories.mockResolvedValue([{ id: 3, name: 'Garden' }]);
        const result = await categoryService.findCategories('Garden');
        expect(categoryRepository.findCategories).toHaveBeenCalledWith('Garden');
        expect(result).toEqual([{ id: 3, name: 'Garden' }]);
    });
});