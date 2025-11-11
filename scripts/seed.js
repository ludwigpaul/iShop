// JavaScript
import 'dotenv/config';
import bcrypt from 'bcryptjs'; // Included in case you later want to seed users
import db from '../models/index.js';

async function run() {
    const sequelize = db.sequelize || db.Sequelize?.sequelize;
    if (!sequelize) {
        console.error('Sequelize instance not found. Ensure models/index.js exports { sequelize, ...models }.');
        process.exit(1);
    }

    // Resolve models (supports both db.<Model> and sequelize.models.<Model>)
    const Categories = db.Categories || sequelize.models?.Categories;
    const Products = db.Products || sequelize.models?.Products;
    const Workers = db.Workers || sequelize.models?.Workers;

    if (!Categories || !Products || !Workers) {
        console.error('One or more required models are missing (Categories, Products, Workers).');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();

        const t = await sequelize.transaction();
        try {
            // 1) Categories (name is unique -> safe to upsert)
            const categoriesData = [
                { name: 'Electronics' },
                { name: 'Books' },
                { name: 'Clothing' },
                { name: 'Home & Kitchen' },
            ];

            await Categories.bulkCreate(categoriesData, {
                updateOnDuplicate: ['name'],
                transaction: t,
            });

            // Map category name -> id to wire up products
            const existingCategories = await Categories.findAll({ transaction: t });
            const catByName = new Map(existingCategories.map(c => [c.name, c.id]));

            // 2) Products (link by category_id). Use findOrCreate for idempotency.
            const productsData = [
                {
                    name: 'Smartphone',
                    description: 'A modern smartphone with OLED display',
                    price: 699.99,
                    stockQuantity: 50,
                    category_id: catByName.get('Electronics'),
                },
                {
                    name: 'Laptop',
                    description: 'Lightweight laptop for work and study',
                    price: 1199.0,
                    stockQuantity: 25,
                    category_id: catByName.get('Electronics'),
                },
                {
                    name: 'Novel',
                    description: 'Bestselling fiction book',
                    price: 14.99,
                    stockQuantity: 200,
                    category_id: catByName.get('Books'),
                },
                {
                    name: 'T-Shirt',
                    description: '100% cotton, unisex fit',
                    price: 19.99,
                    stockQuantity: 150,
                    category_id: catByName.get('Clothing'),
                },
                {
                    name: 'Blender',
                    description: 'High-speed kitchen blender',
                    price: 89.99,
                    stockQuantity: 40,
                    category_id: catByName.get('Home & Kitchen'),
                },
            ].filter(p => Boolean(p.category_id)); // Skip if a category wasn’t created

            for (const p of productsData) {
                await Products.findOrCreate({
                    where: { name: p.name, category_id: p.category_id },
                    defaults: p,
                    transaction: t,
                });
            }

            // 3) Workers (email is unique -> safe to upsert)
            const workersData = [
                { name: 'Worker One', email: 'worker1@example.com' },
                { name: 'Worker Two', email: 'worker2@example.com' },
            ];

            await Workers.bulkCreate(workersData, {
                updateOnDuplicate: ['name'],
                transaction: t,
            });

            await t.commit();
            console.log('Seeding completed successfully.');
            process.exit(0);
        } catch (err) {
            await t.rollback();
            console.error('Seeding failed, transaction rolled back:', err);
            process.exit(1);
        }
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

run();