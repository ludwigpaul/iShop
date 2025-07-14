import {Sequelize} from 'sequelize';
import {dbConfig} from '../config/db.config.js';

import UsersModel from './users.model.js';
import CategoriesModel from './categories.model.js';
import ProductsModel from './products.model.js';
import OrdersModel from './orders.model.js';
import WorkersModel from './workers.model.js';



// Initialize Sequelize with the database configuration
const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, null, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
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

db.Users.hasMany(db.Orders, { foreignKey: 'userId' });
db.Orders.belongsTo(db.Users, { foreignKey: 'userId' });

db.Workers.hasMany(db.Orders, { foreignKey: 'workerId' });
db.Orders.belongsTo(db.Workers, { foreignKey: 'workerId' });

db.Orders.belongsTo(db.Products, { foreignKey: 'productId' });
db.Products.hasMany(db.Orders, { foreignKey: 'productId' });

export default db;