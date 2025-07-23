import { Sequelize, DataTypes } from 'sequelize';
import defineWorker from '../../models/workers.model.js';

describe('Workers Model', () => {
    let sequelize;
    let Worker;

    beforeAll(() => {
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
        Worker = defineWorker(sequelize, DataTypes);
    });

    it('should define the Workers model', () => {
        expect(Worker).toBeDefined();
        expect(Worker.tableName).toBe('workers');
        expect(Worker.options.timestamps).toBe(false);
    });

    it('should have correct fields and types', () => {
        const attrs = Worker.rawAttributes;
        expect(attrs.id.type instanceof DataTypes.INTEGER).toBe(true);
        expect(attrs.id.primaryKey).toBe(true);
        expect(attrs.id.autoIncrement).toBe(true);

        expect(attrs.name.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.name.allowNull).toBe(false);

        expect(attrs.email.type instanceof DataTypes.STRING).toBe(true);
        expect(attrs.email.allowNull).toBe(false);
        expect(attrs.email.unique).toBe(true);
    });

    it('should create and retrieve a worker', async () => {
        await sequelize.sync({ force: true });
        const worker = await Worker.create({
            name: 'John Doe',
            email: 'john@example.com'
        });
        expect(worker.id).toBeGreaterThan(0);
        expect(worker.name).toBe('John Doe');
        expect(worker.email).toBe('john@example.com');

        const found = await Worker.findByPk(worker.id);
        expect(found).not.toBeNull();
        expect(found.name).toBe('John Doe');
    });

    it('should enforce unique email', async () => {
        await sequelize.sync({ force: true });
        await Worker.create({ name: 'Jane', email: 'jane@example.com' });
        await expect(
            Worker.create({ name: 'Jane2', email: 'jane@example.com' })
        ).rejects.toThrow();
    });

    it('should not create a worker without a name', async () => {
        await sequelize.sync({ force: true });
        await expect(
            Worker.create({ email: 'noname@example.com' })
        ).rejects.toThrow();
    });

    it('should not create a worker without an email', async () => {
        await sequelize.sync({ force: true });
        await expect(
            Worker.create({ name: 'NoEmail' })
        ).rejects.toThrow();
    });

    it('should update a worker\'s name', async () => {
        await sequelize.sync({ force: true });
        const worker = await Worker.create({ name: 'Old Name', email: 'old@example.com' });
        worker.name = 'New Name';
        await worker.save();
        const updated = await Worker.findByPk(worker.id);
        expect(updated.name).toBe('New Name');
    });

    it('should delete a worker', async () => {
        await sequelize.sync({ force: true });
        const worker = await Worker.create({ name: 'ToDelete', email: 'delete@example.com' });
        await worker.destroy();
        const found = await Worker.findByPk(worker.id);
        expect(found).toBeNull();
    });
});