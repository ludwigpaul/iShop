import {Sequelize} from 'sequelize';
import {dbConfig} from '../config/db.config.js';
import logger from '../logger/logger.js';

import UsersModel from './users.model.js';
import CategoriesModel from './categories.model.js';
import ProductsModel from './products.model.js';
import OrdersModel from './orders.model.js';
import WorkersModel from './workers.model.js';



const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, null, {
    host: dbConfig.HOST,
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
    retry: {
        match: [
            /ECONNRESET/,
            /ENOTFOUND/,
            /ECONNREFUSED/,
            /ETIMEDOUT/,
            /EHOSTUNREACH/,
            /EAI_AGAIN/
        ],
        max: 3
    },
    dialectOptions: {
        connectTimeout: 30000,    // Connection timeout
        acquireTimeout: 30000,    // Acquire timeout
        timeout: 30000,           // Query timeout
        multipleStatements: false
    },
    logging: console.log // Enable logging to debug connection
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


// Initialize models
db.Users = UsersModel(sequelize, Sequelize);
db.Categories = CategoriesModel(sequelize, Sequelize);
db.Products = ProductsModel(sequelize, Sequelize);
db.Orders = OrdersModel(sequelize, Sequelize);
db.Workers = WorkersModel(sequelize, Sequelize);

db.Categories.hasMany(db.Products, {as: 'products', foreignKey: 'category_id'});
db.Products.belongsTo(db.Categories, {as: 'category', foreignKey: 'category_id'});

db.Users.hasMany(db.Orders, { foreignKey: 'user_id' });
db.Orders.belongsTo(db.Users, { foreignKey: 'user_id' });

db.Workers.hasMany(db.Orders, { foreignKey: 'worker_id' });
db.Orders.belongsTo(db.Workers, { foreignKey: 'worker_id' });

db.Orders.belongsTo(db.Products, { foreignKey: 'product_id' });
db.Products.hasMany(db.Orders, { foreignKey: 'product_id' });

const initializeDatabase = async () => {
    try {
        // Test database connection first
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');

        // Drop all tables if they exist (for clean start)
        await sequelize.drop({ cascade: true });
        logger.info('Dropped existing tables');


        // Create tables in the correct order (dependencies first)
        await db.Users.sync({ force: false });
        logger.info('Users table synchronized');

        await db.Categories.sync({ force: false });
        logger.info('Categories table synchronized');

        await db.Workers.sync({ force: false });
        logger.info('Workers table synchronized');

        await db.Products.sync({ force: false });
        logger.info('Products table synchronized');

        // Orders table last (has foreign keys to all other tables)
        await db.Orders.sync({ force: false });
        logger.info('Orders table synchronized');

        logger.info('All database tables synchronized successfully');
    } catch (error) {
        logger.error('Failed to initialize database:', error);
        throw error;
    }
};

initializeDatabase()
    .then(() => logger.info('Database initialized successfully'))
    .catch(err => logger.error('Error initializing database:', err));

export default db;