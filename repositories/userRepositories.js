import {db} from "../config/dbConfig.js";
import logger from "../logger/logger.js";
import bcrypt from 'bcryptjs';

// The repository for managing users in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on users.

// Function to get all users (only IDS, username, and email)
const getAllUsers = async () => {
    const [rows] = await db.query('SELECT id, username, email, verified FROM ishop.users');
    return rows;
};

// Function to get a user by ID
const getUserById = async (id) => {
    const [rows] = await db.query('SELECT id, username, email, verified FROM ishop.users WHERE id = ?', [id]);
    return rows[0];
};

// Function to create a new user
const createUser = async (user) => {
    const { username, email, password, verified = false, verificationToken = null } = user;
    const [result] = await db.query(
        'INSERT INTO ishop.users (username, email, password, verified, verificationToken) VALUES (?, ?, ?, ?, ?)',
        [username, email, password, verified, verificationToken]
    );
    return { id: result.insertId, username, email, password, verified, verificationToken };
};

// Function to get user by username and password
const getUserByUserNameAndPassword = async (username, password) => {
    const [rows] = await db.query('SELECT * FROM ishop.users WHERE username = ? AND password = ?', [username, password]);
    return rows[0]; // Return the first row if found
};

// Function to get user by email
const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT id, username, email, password, role FROM ishop.users WHERE email = ?', [email]);
    return rows[0];
};

// Function to get user by username
const getUserByUserName = async (username) => {
    const [rows] = await db.query('SELECT id, username, email, password, role FROM ishop.users WHERE username = ?', [username]);
    return rows[0];
};

// Function to update a user by ID
const updateUser = async (id, user) => {
    logger.info('Updating user: %o', {id, user});
    const {username, email, password} = user;

    let query, params;
    if (password) {
        query = 'UPDATE ishop.users SET username = ?, email = ?, password = ? WHERE id = ?';
        params = [username, email, password, id];
    } else {
        query = 'UPDATE ishop.users SET username = ?, email = ? WHERE id = ?';
        params = [username, email, id];
    }
    await db.query(query, params);
    return {id, username, email};
}

// Function to delete a user by ID
const deleteUser = async (id) => {
    await db.query('DELETE FROM ishop.users WHERE id = ?', [id]);
    return {message: 'User deleted successfully'};
};

// Function to find users by username or email
const findUsers = async (emailOrUserName) => {
    const [rows] = await db.query('SELECT * FROM ishop.users WHERE username = ? OR email = ?', [emailOrUserName, emailOrUserName]);
    return rows;
};

const findByUsername = async (username) => {
    const [rows] = await db.query('SELECT * FROM ishop.users WHERE username = ?', [username]);
    return rows[0];
};

const comparePassword = async (plain, hash) => {
    return await bcrypt.compare(plain, hash);
};

const findByVerificationToken = async (token) => {
    const [rows] = await db.query('SELECT * FROM ishop.users WHERE verificationToken = ?', [token]);
    return rows[0];
};
const verifyUser = async (id) => {
    await db.query('UPDATE ishop.users SET verified = TRUE, verificationToken = NULL WHERE id = ?', [id]);
};

const getAllWorkers = async () => {
    const [rows] = await db.query('SELECT id, username, email FROM ishop.users WHERE UPPER(role) = "WORKER"');
    return rows;
};

const assignOrderToWorker = async (orderId, workerId) => {
    logger.info(`Assigning order ${orderId} to worker ${workerId}`);
    await db.query('UPDATE ishop.orders SET worker_id = ? WHERE id = ?', [workerId, orderId]);
    logger.info(`Assigned order ${orderId} to worker ${workerId}`);
};

const getOrdersByWorker = async (workerId) => {
    const [rows] = await db.query(
        'SELECT id, description, completed_at FROM ishop.orders WHERE worker_id = ?',
        [workerId]
    );
    return rows;
};


// Export the repository functions
export default {
    getAllUsers,
    getUserByUserName,
    getUserByEmail,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    findUsers,
    findByUsername,
    comparePassword,
    findByVerificationToken,
    verifyUser,
    getAllWorkers,
    assignOrderToWorker,
    getOrdersByWorker
};

