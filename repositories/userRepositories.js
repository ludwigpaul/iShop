import {db} from "../config/dbConfig.js";

// The repository for managing users in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on users.

// Function to get all users (only IDS, username, and email)
const getAllUsers = async () => {
    const [rows] = await db.query('SELECT id, username, email FROM ishop.Users');
    return rows;
};

// Function to get a user by ID
const getUserById = async (id) => {
    const [rows] = await db.query('SELECT id, username , email FROM ishop.Users WHERE id = ?', [id]);
    return rows[0]; // Return the first row if found
};

// Function to create a new user
const createUser = async (user) => {
    const {username, email, password} = user;
    const [result] = await db.query('INSERT INTO ishop.Users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    return {id: result.insertId, username, email, password};
};


// Function to get user by username and password
const getUserByUserNameAndPassword = async (username, password) => {
    const [rows] = await db.query('SELECT * FROM ishop.Users WHERE username = ? AND password = ?', [username, password]);
    return rows[0]; // Return the first row if found
};

// Function to get user by email
const getUserByEmail = async (email) => {
    const [rows] = await db.query('SELECT id, username , email , password FROM ishop.Users WHERE email = ?', [email]);
    return rows[0]; // Return the first row if found
};

// Function to get user by username
const getUserByUserName = async (username) => {
    const [rows] = await db.query('SELECT id, username , email , password FROM ishop.Users WHERE username = ?', [username]);
    return rows[0]; // Return the first row if found
};

// Function to update a user by ID

const updateUser = async (id, user) => {
    const {username, email, password} = user;
    await db.query('UPDATE ishop.Users SET username = ?, email = ?, password = ? WHERE id = ?', [username, email, password, id]);
    return {id, username, email};
}

// Function to delete a user by ID
const deleteUser = async (id) => {
    await db.query('DELETE FROM ishop.Users WHERE id = ?', [id]);
    return {message: 'User deleted successfully'};
};

// Function to find users by username or email
const findUsers = async (emailOrUserName) => {
    const [rows] = await db.query('SELECT * FROM ishop.Users WHERE username = ? OR email = ?', [emailOrUserName, emailOrUserName]);
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
    findUsers
};

