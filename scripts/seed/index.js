import 'dotenv/config';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';

import categoriesData from './data/categories.js';
import productsData from './data/products.js';
import usersData from './data/users.js';

/**
 * Notes:
 * - Adjust model names if they differ (e.g., db.Users vs db.User).
 * - This script is idempotent: it upserts by a natural unique key (slug/email/name).
 */

const { sequelize } = db;

// Ensure required models exist
function assertModels() {
    const required = ['User', 'Category', 'Product'];
    const missing = required.filter((m) => !db[m]);
    if (missing.length) {
        throw new Error(`Missing Sequelize models: ${missing.join(', ')}`);
    }
}

async function findOrUpsert(Model, where, defaults, t) {
    const [instance, created] = await Model.findOrCreate({ where, defaults, transaction: t });
    if (!created) {
        await instance.update(defaults, { transaction: t });
    }
    return instance;
}

function hasAttr(Model, attr) {
    return Boolean(Model?.rawAttributes?.[attr]);
}

async function seedUsers(t) {
    if (!db.User) return;
    const userPasswordField = hasAttr(db.User, 'passwordHash')
        ? 'passwordHash'
        : hasAttr(db.User, 'password')
            ? 'password'
            : null;

    if (!userPasswordField) {
        throw new Error('User model must have either "passwordHash" or "password" attribute.');
    }

    for (const u of usersData) {
        const hashed = await bcrypt.hash(u.password, 10);
        const payload = {
            email: u.email,
            username: u.username,
            role: u.role ?? 'customer',
            isVerified: u.isVerified ?? false
        };
        payload[userPasswordField] = hashed;

        await findOrUpsert(
            db.User,
            { email: u.email }, // upsert by email
            payload,
            t
        );
    }
}

async function seedCategories(t) {
    if (!db.Category) return;
    const mapBySlug = new Map();

    for (const c of categoriesData) {
        const payload = {
            slug: c.slug,
            name: c.name,
            description: c.description ?? null
        };
        const category = await findOrUpsert(
            db.Category,
            { slug: c.slug }, // upsert by slug
            payload,
            t
        );
        mapBySlug.set(c.slug, category.id);
    }

    return mapBySlug;
}

async function seedProducts(categorySlugToId, t) {
    if (!db.Product) return;
    const hasCategoryId = hasAttr(db.Product, 'categoryId');
    const hasInStock = hasAttr(db.Product, 'inStock');
    const hasQuantity = hasAttr(db.Product, 'quantity');
    const hasImageUrl = hasAttr(db.Product, 'imageUrl');

    for (const p of productsData) {
        const payload = {
            name: p.name,
            description: p.description ?? null,
            price: p.price
        };
        if (hasInStock) payload.inStock = Boolean(p.inStock);
        if (hasQuantity) payload.quantity = p.quantity ?? 0;
        if (hasImageUrl) payload.imageUrl = p.imageUrl ?? null;
        if (hasCategoryId && p.categorySlug) {
            const catId = categorySlugToId.get(p.categorySlug);
            if (!catId) {
                throw new Error(`Category with slug "${p.categorySlug}" not found while seeding product "${p.name}".`);
            }
            payload.categoryId = catId;
        }

        await findOrUpsert(
            db.Product,
            { name: p.name }, // upsert by name (ensure unique or adjust to your uniqueness)
            payload,
            t
        );
    }
}

async function main() {
    assertModels();

    const t = await sequelize.transaction();
    try {
        // Optional: clear tables before seeding (toggle via env)
        if (process.env.CLEAR_BEFORE_SEED === 'true') {
            // Order matters if you have FKs: child -> parent
            if (db.Product) await db.Product.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction: t });
            if (db.Category) await db.Category.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction: t });
            if (db.User) await db.User.destroy({ where: {}, truncate: true, cascade: true, force: true, transaction: t });
        }

        await seedUsers(t);
        const catMap = await seedCategories(t);
        await seedProducts(catMap, t);

        await t.commit();
        console.log('✅ Seed completed successfully');
        process.exit(0);
    } catch (err) {
        await t.rollback();
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
}

main();