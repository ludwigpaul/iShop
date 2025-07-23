import { Sequelize, DataTypes } from 'sequelize';
import defineCategory from '../../models/categories.model.js';

describe('Categories Model', () => {
    let sequelize;
    let Category;

    beforeAll(() => {
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        Category = defineCategory(sequelize, DataTypes);
    });

    it('should define the Categories model', () => {
        expect(Category).toBeDefined();
        expect(Category.tableName).toBe('Categories');
        expect(Category.options.timestamps).toBe(false);
    });

    it('should have id, name fields with correct types', () => {
        expect(Category.rawAttributes.id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(Category.rawAttributes.id.primaryKey).toBe(true);
        expect(Category.rawAttributes.id.autoIncrement).toBe(true);

        expect(Category.rawAttributes.name.type instanceof DataTypes.STRING).toBe(true);
        expect(Category.rawAttributes.name.allowNull).toBe(false);
        expect(Category.rawAttributes.name.unique).toBe(true);
    });

    it('should create and retrieve a category', async () => {
        await sequelize.sync({ force: true });
        const cat = await Category.create({ name: 'TestCat' });
        expect(cat.id).toBeGreaterThan(0);
        expect(cat.name).toBe('TestCat');

        const found = await Category.findByPk(cat.id);
        expect(found.name).toBe('TestCat');
    });

    it('should enforce unique name', async () => {
        await sequelize.sync({ force: true });
        await Category.create({ name: 'UniqueCat' });
        await expect(Category.create({ name: 'UniqueCat' })).rejects.toThrow();
    });

});