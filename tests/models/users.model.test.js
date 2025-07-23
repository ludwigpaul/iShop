import { Sequelize, DataTypes } from 'sequelize';
import defineUser from '../../models/users.model.js';

describe('Users Model', () => {
    let sequelize;
    let User;

    beforeAll(() => {
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        User = defineUser(sequelize, DataTypes);
    });

    it('should define the Users model', () => {
        expect(User).toBeDefined();
        expect(User.tableName).toBe('users');
        expect(User.options.timestamps).toBe(true);
    });

    // javascript
    it('should have correct fields and types', () => {
        const attrs = User.rawAttributes;
        expect(attrs.id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.id.primaryKey).toBe(true);
        expect(attrs.id.autoIncrement).toBe(true);

        expect(attrs.username.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.username.allowNull).toBe(false);
        expect(attrs.username.unique).toBe(true);

        expect(attrs.email.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.email.allowNull).toBe(false);
        expect(attrs.email.unique).toBe(true);

        expect(attrs.password.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.password.allowNull).toBe(false);

        expect(attrs.role.type instanceof DataTypes.ENUM).toBe(true);
        expect(attrs.role.values).toEqual(['ADMIN', 'USER', 'WORKER']);
        expect(attrs.role.defaultValue).toBe('USER');

        expect(attrs.verified.type instanceof DataTypes.BOOLEAN).toBe(true);
        expect(attrs.verified.defaultValue).toBe(false);

        expect(attrs.verification_token.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.verification_token.allowNull).toBe(true);

        expect(attrs.verificationExpiry.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.verificationExpiry.allowNull).toBe(true);

        expect(attrs.verificationDate.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.verificationDate.allowNull).toBe(true);

        expect(attrs.createdAt.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.createdAt.field).toBe('created_at');
        expect(attrs.updatedAt.type instanceof DataTypes.DATE).toBe(true);
        expect(attrs.updatedAt.field).toBe('updated_at');
    });

    it('should create and retrieve a user', async () => {
        await sequelize.sync({ force: true });
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'secret'
        });
        expect(user.id).toBeGreaterThan(0);
        expect(user.username).toBe('testuser');
        expect(user.email).toBe('test@example.com');
        expect(user.role).toBe('USER');
        expect(user.verified).toBe(false);

        const found = await User.findByPk(user.id);
        expect(found).not.toBeNull();
        expect(found.username).toBe('testuser');
    });
});