import db from "../models/index.js";
import logger from "../logger/logger.js";
import bcrypt from 'bcryptjs';


const Users = db.Users;
// The repository for managing users in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on users.

// Function to get all users (only IDS, username, and email)
export const getAllUsers = async (offset = 1, limit = 10) => {
    logger.info('Fetching all users with pagination', {offset, limit});
    const users = await Users.findAndCountAll
    ({
        attributes: ['id', 'username', 'email', 'verified'],
        offset: offset,
        limit: limit
    });
    const total = users.count;
    return { users, total };
};

// Function to get a user by ID
const getUserById = async (id) => {
    const user = await Users.findByPk(id, {
        attributes: ['id', 'username', 'email', 'verified']
    });
    logger.info('Getting user with ID: %d', id);
    return user;
};

// Function to create a new user
const createUser = async (user) => {
    const {
        username,
        email,
        password,
        verified = false,
        verificationToken = null
    } = user;

    const newUser = await Users.create({
        username,
        email,
        password,
        verified,
        verification_token: verificationToken
    });
    logger.info('Created new user: %o', {id: newUser.id, username, email});
    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        verified: newUser.verified
    };
};

// Function to get user by email
const getUserByEmail = async (email) => {
    const user = await Users.findOne({
        where: { email },
        attributes: ['id', 'username', 'email', 'password', 'role']
    });
    logger.info('Getting user by email: %o', {email, user});
    return user;
};

// Function to get user by username
const getUserByUserName = async (username) => {
    const user = await Users.findOne({
        where: { username },
        attributes: ['id', 'username', 'email', 'password', 'role']
    });
    logger.info('Getting user by username: %o', {username, user});
    return user;
};

// Function to update a user by ID
const updateUser = async (id, user) => {
    logger.info('Updating user: %o', {id, user});
    const {username, email, password} = user;

    const updatedUser = await Users.update(
        { username, email, password },
        {
            where: { id },
            returning: true,
            plain: true
        }
    );
    if (updatedUser[0] === 0) {
        logger.warn('No user found with ID: %d', id);
        throw new Error('User not found');
    }
}

// Function to delete a user by ID
const deleteUser = async (id) => {
    const count = await Users.destroy({ where: { id } });
    logger.info('Deleting user with ID: %d', id);
    return count > 0 ? { message: 'User deleted successfully' } : { message: 'User not found' };
};

// Function to find users by username or email
const findUsers = async (searchTerm, offset = 0, limit = 10) => {
    const users = await Users.findAll({
        where: {
            [db.Sequelize.Op.or]: [
                { username: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
                { email: { [db.Sequelize.Op.like]: `%${searchTerm}%` } }
            ]
        },
        attributes: ['id', 'username', 'email', 'verified'],
        offset: offset,
        limit: limit
    });
    logger.info('Finding users with search term: %s. Total found: %d', searchTerm, users.length);
    return users;
};

const findByUsername = async (username) => {
    const user = await Users.findOne({where: { username }});
    logger.info('Finding user by username: %o', {username, user});
    return user;
};

const getAdminByUsername = async (username) => {
    const adminUser = await Users.findOne({
        where: { username, role: 'ADMIN' }
    });
    console.log('Getting admin user by username:', {username, adminUser});
    return adminUser;
};

const comparePassword = async (plain, hash) => {
    return await bcrypt.compare(plain, hash);
};

// TOD: assert that the verification token has not expired
const findByVerificationToken = async (token, expiry) => {
    const user = await Users.findOne({
        where: {
            verification_token: token,
            verification_expiry: {
                [db.Sequelize.Op.gte]: expiry // Ensure the token has not expired
            }
        }
    });
    logger.info('Finding user by verification token: %o', {token, user});
    return user;
};

const insertVerificationToken = async (id, token, timeStamp) => {

    logger.info('Inserted verification token for user ID: %d', id);
    const result = await Users.update(
        { verification_token: token, verification_expiry: timeStamp },
        { where: { id } }
    );
    if (result[0] === 0) {
        logger.warn('No user found with ID: %d', id);
        throw new Error('User not found');
    }
};

const verifyUser = async (id, verification_date) => {
    const result = await Users.update(
        { verified: true, verification_date, verification_token: null },
        { where: { id } }
    );
    if (result[0] === 0) {
        logger.warn('No user found with ID: %d', id);
        throw new Error('User not found');
    }
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
    getAdminByUsername,
    insertVerificationToken
};

