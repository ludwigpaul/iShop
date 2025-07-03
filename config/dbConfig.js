import dotenv from 'dotenv';
import mysql from 'mysql2';
import logger from "../logger/logger.js";

dotenv.config();

logger.info(`Connecting to MySQL database at ${process.env.DB_HOST}:${process.env.DB_PORT}...`);
logger.info(`User: ${process.env.DB_USER}`);
logger.info(`Password: ${process.env.DB_PASSWORD}`);
logger.info(`Database: ${process.env.DB_NAME}`);

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306, // Default MySQL port is 3306
    user: 'root',
    password: 'J0n454848(((',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Adjust based on your application's needs
    queueLimit: 0, // No limit on the queue length
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Check if the connection is successful
pool.getConnection((err, connection) => {
    if (err) {
        logger.error('Error connecting to the database:', err);
        throw err; // Throw error to stop the application if connection fails
    }
    logger.info('Connected to the database successfully');
    connection.release(); // Release the connection back to the pool
});

export const db = pool.promise(); // Use promise-based API for async/await support
