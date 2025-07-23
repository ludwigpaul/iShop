import { jest } from '@jest/globals';
import categoryRepository from '../../repositories/categoryRepository.js';

jest.unstable_mockModule('../../models/index.js', () => ({
    __esModule: true,
    default: {
        Categories: {
            findAll: () => {},
            findByPk: () => {},
            create: () => {},
            update: () => {},
            destroy: () => {}
        },
        Sequelize: {
            Op: {
                or: 'or',
                like: 'like'
            }
        }
    }
}));
jest.unstable_mockModule('../../logger/logger.js', () => ({
    __esModule: true,
    default: { info: jest.fn() }
}));

let repo, db;

beforeAll(async () => {
    repo = (await import('../../repositories/categoryRepository.js')).default;
    db = (await import('../../models/index.js')).default;
});

beforeEach(() => {
    // Reassign all mocks to jest.fn()
    db.Categories.findAll = jest.fn();
    db.Categories.findByPk = jest.fn();
    db.Categories.create = jest.fn();
    db.Categories.update = jest.fn();
    db.Categories.destroy = jest.fn();
    jest.clearAllMocks();
});

describe('categoryRepository', () => {
    it('getAllCategories returns categories', async () => {
        db.Categories.findAll.mockResolvedValue([{ id: 1 }]);
        const result = await repo.getAllCategories();
        expect(result).toEqual([{ id: 1 }]);
        expect(db.Categories.findAll).toHaveBeenCalled();
    });

    it('getCategoryById returns a category', async () => {
        db.Categories.findByPk.mockResolvedValue({ id: 2 });
        const result = await repo.getCategoryById(2);
        expect(result).toEqual({ id: 2 });
        expect(db.Categories.findByPk).toHaveBeenCalledWith(2);
    });

    it('createCategory creates and returns a category', async () => {
        db.Categories.create.mockResolvedValue({ id: 3, name: 'Test' });
        const result = await repo.createCategory({ name: 'Test' });
        expect(result).toEqual({ id: 3, name: 'Test' });
        expect(db.Categories.create).toHaveBeenCalledWith({ name: 'Test' });
    });

    it('updateCategory updates and returns a category', async () => {
        db.Categories.update.mockResolvedValue([1, { id: 4, name: 'Updated' }]);
        const result = await repo.updateCategory(4, { name: 'Updated' });
        expect(result).toEqual({ id: 4, name: 'Updated' });
        expect(db.Categories.update).toHaveBeenCalledWith(
            { name: 'Updated' },
            { where: { id: 4 }, returning: true, plain: true }
        );
    });

    it('deleteCategory returns success message if deleted', async () => {
        db.Categories.destroy.mockResolvedValue(1);
        const result = await repo.deleteCategory(5);
        expect(result).toEqual({ message: 'Category deleted successfully' });
        expect(db.Categories.destroy).toHaveBeenCalledWith({ where: { id: 5 } });
    });

    it('deleteCategory returns not found message if not deleted', async () => {
        db.Categories.destroy.mockResolvedValue(0);
        const result = await repo.deleteCategory(6);
        expect(result).toEqual({ message: 'Category not found' });
    });

    it('findCategories returns found categories', async () => {
        db.Categories.findAll.mockResolvedValue([{ id: 7 }]);
        const result = await repo.findCategories('search');
        expect(result).toEqual([{ id: 7 }]);
        expect(db.Categories.findAll).toHaveBeenCalled();
    });
});