import { Sequelize, DataTypes } from 'sequelize';
import defineProduct from '../../models/products.model.js';

describe('Products Model', () => {
    let sequelize;
    let Product;
    let Category;

    beforeAll(() => {
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        Category = sequelize.define('Categories', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: DataTypes.STRING
        }, { tableName: 'Categories', timestamps: false });
        Product = defineProduct(sequelize, DataTypes);

        Product.belongsTo(Category, { foreignKey: 'categoryId' });
        Category.hasMany(Product, { foreignKey: 'categoryId' });
    });

    it('should define the Products model', () => {
        expect(Product).toBeDefined();
        expect(Product.tableName).toBe('Products');
        expect(Product.options.timestamps).toBe(false);
    });

    it('should have correct fields and types', () => {
        const attrs = Product.rawAttributes;
        expect(attrs.id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.id.primaryKey).toBe(true);
        expect(attrs.id.autoIncrement).toBe(true);

        expect(attrs.name.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.name.allowNull).toBe(false);
        expect(attrs.name.unique).toBe(true);

        expect(attrs.description.type instanceof DataTypes.TEXT).toBe(true);
        expect(attrs.description.allowNull).toBe(true);

        expect(attrs.price.type instanceof DataTypes.DECIMAL).toBe(true);
        expect(attrs.price.allowNull).toBe(false);

        expect(attrs.stockQuantity.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.stockQuantity.allowNull).toBe(false);
        expect(attrs.stockQuantity.defaultValue).toBe(0);

        expect(attrs.categoryId.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.categoryId.references.model).toBe('Categories');
        expect(attrs.categoryId.field).toBe('category_id');
    });

    it('should create and retrieve a product', async () => {
        await sequelize.sync({ force: true });
        const cat = await Category.create({ name: 'TestCat' });
        const prod = await Product.create({
            name: 'TestProduct',
            price: "19.99",
            stockQuantity: 5,
            categoryId: cat.id
        });
        expect(prod.id).toBeGreaterThan(0);
        expect(prod.name).toBe('TestProduct');
        expect(prod.price).toBe('19.99');
        expect(prod.stockQuantity).toBe(5);
        expect(prod.categoryId).toBe(cat.id);

        const found = await Product.findByPk(prod.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe('TestProduct');
    });

    it('should not create a product with a negative price', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'TestCategory' });
        await expect(
            Product.create({
                name: 'InvalidProduct',
                price: -10.99,
                stockQuantity: 5,
                categoryId: category.id
            })
        ).rejects.toThrow();
    });

    it('should not create a product with negative stock quantity', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'TestCategory' });
        await expect(
            Product.create({
                name: 'InvalidStock',
                price: 10.99,
                stockQuantity: -5,
                categoryId: category.id
            })
        ).rejects.toThrow();
    });

    it('should retrieve products with their associated category', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'Electronics' });
        const product = await Product.create({
            name: 'Smartphone',
            price: 699.99,
            stockQuantity: 10,
            categoryId: category.id
        });

        const found = await Product.findOne({
            where: { id: product.id },
            include: Category
        });

        expect(found).not.toBeNull();
        expect(found.Category.name).toBe('Electronics');
    });

    it('should handle bulk creation of products', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'BulkCategory' });
        const products = await Product.bulkCreate([
            { name: 'Product1', price: 10.99, stockQuantity: 5, categoryId: category.id },
            { name: 'Product2', price: 20.99, stockQuantity: 10, categoryId: category.id }
        ]);

        expect(products.length).toBe(2);
        const found = await Product.findAll({ where: { categoryId: category.id } });
        expect(found.length).toBe(2);
    });

    it('should not allow duplicate product names', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'UniqueCategory' });
        await Product.create({
            name: 'UniqueProduct',
            price: 19.99,
            stockQuantity: 5,
            categoryId: category.id
        });

        await expect(
            Product.create({
                name: 'UniqueProduct',
                price: 29.99,
                stockQuantity: 10,
                categoryId: category.id
            })
        ).rejects.toThrow();
    });

    it('should handle extremely large stock quantities', async () => {
        await sequelize.sync({ force: true });
        const category = await Category.create({ name: 'LargeStockCategory' });
        const product = await Product.create({
            name: 'LargeStockProduct',
            price: 99.99,
            stockQuantity: 1000000,
            categoryId: category.id
        });

        expect(product.stockQuantity).toBe(1000000);
    });
});