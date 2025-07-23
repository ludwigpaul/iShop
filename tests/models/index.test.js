// tests/models/index.test.js
import db from '../../models/index.js';

describe('models/index.js', () => {
    it('should export a db object with Sequelize and sequelize', () => {
        expect(db.Sequelize).toBeDefined();
        expect(db.sequelize).toBeDefined();
        expect(typeof db.sequelize.authenticate).toBe('function');
    });

    it('should initialize all models', () => {
        expect(db.Users).toBeDefined();
        expect(db.Categories).toBeDefined();
        expect(db.Products).toBeDefined();
        expect(db.Orders).toBeDefined();
        expect(db.Workers).toBeDefined();
    });

    it('should set up model associations', () => {
        // Check that associations object exists
        expect(db.Categories.associations).toBeDefined();
        expect(db.Products.associations).toBeDefined();
        expect(db.Users.associations).toBeDefined();
        expect(db.Orders.associations).toBeDefined();
        expect(db.Workers.associations).toBeDefined();

        // Check for at least one association per model
        expect(Object.keys(db.Categories.associations).length).toBeGreaterThan(0);
        expect(Object.keys(db.Products.associations).length).toBeGreaterThan(0);
        expect(Object.keys(db.Users.associations).length).toBeGreaterThan(0);
        expect(Object.keys(db.Orders.associations).length).toBeGreaterThan(0);
        expect(Object.keys(db.Workers.associations).length).toBeGreaterThan(0);
    });

    it('should have correct sequelize config', () => {
        expect(db.sequelize.getDialect()).toBeDefined();
        expect(db.sequelize.config).toHaveProperty('database');
        expect(db.sequelize.config).toHaveProperty('username');
    });
});