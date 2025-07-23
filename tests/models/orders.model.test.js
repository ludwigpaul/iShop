import { Sequelize, DataTypes } from 'sequelize';
import defineOrder from '../../models/orders.model.js';

describe('Orders Model', () => {
    let sequelize;
    let Order;

    beforeAll(() => {
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        Order = defineOrder(sequelize, DataTypes);
    });

    it('should define the Orders model', () => {
        expect(Order).toBeDefined();
        expect(Order.tableName).toBe('orders');
        expect(Order.options.timestamps).toBe(false);
    });

    it('should have correct fields and types', () => {
        const attrs = Order.rawAttributes;
        expect(attrs.id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.id.primaryKey).toBe(true);
        expect(attrs.id.autoIncrement).toBe(true);

        expect(attrs.product_id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.product_id.allowNull).toBe(false);
        expect(attrs.product_id.references.model).toBe('products');

        expect(attrs.user_id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.user_id.allowNull).toBe(false);
        expect(attrs.user_id.references.model).toBe('users');

        expect(attrs.quantity.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.quantity.allowNull).toBe(false);

        expect(attrs.status.type instanceof DataTypes.ENUM).toBe(true);
        expect(attrs.status.values).toEqual(['PENDING', 'COMPLETED']);
        expect(attrs.status.defaultValue).toBe('PENDING');

        expect(attrs.order_date.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.status_date.type instanceof DataTypes.DATE).toBe(true);

        expect(attrs.completed_at.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.completed_at.allowNull).toBe(true);

        expect(attrs.estimated_arrival.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.estimated_arrival.allowNull).toBe(true);

        expect(attrs.worker_id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.worker_id.allowNull).toBe(true);
    });
});