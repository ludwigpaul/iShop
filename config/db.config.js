import dotenv from 'dotenv';

dotenv.config();

// Export the database configuration for MySQL connection
export const dbConfig = {
    HOST: process.env.DB_HOST,
    PORT: parseInt(process.env.DB_PORT) || 3306, // Default MySQL port is 3306
    USER: 'root',
    DATABASE: process.env.DB_NAME,
    dialect: 'mysql',
    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 5, // Maximum number of connections in pool
        min: parseInt(process.env.DB_POOL_MIN) || 0, // Minimum number of connections in pool
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000, // Maximum time (in ms) to try to get a connection before throwing an error
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000 // Maximum time (in ms) that a connection can be idle before being released
    }
};

