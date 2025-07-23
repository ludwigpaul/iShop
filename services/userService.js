import userRepositories from '../repositories/userRepository.js';

function getErrorMessage(err) {
    return err && err.message ? err.message : String(err);
}

const getAllUsers = async (page = 1, limit = 10) => {
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        page = isNaN(page) ? 1 : Math.max(1, page);
        limit = isNaN(limit) ? 10 : Math.max(1, limit);
        const offset = (page - 1) * limit;
        return await userRepositories.getAllUsers(offset, limit);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const getUserById = async (id) => {
    if (!id) throw new Error('User ID is required');
    try {
        return await userRepositories.getUserById(id);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const getUserByEmail = async (email) => {
    if (!email) throw new Error('Email is required');
    try {
        return await userRepositories.getUserByEmail(email);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const getUserByUserName = async (username) => {
    if (!username) throw new Error('Username is required');
    try {
        return await userRepositories.getUserByUserName(username);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const createUser = async (user) => {
    if (!user || typeof user !== 'object') throw new Error('User data is required');
    try {
        return await userRepositories.createUser(user);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const updateUser = async (id, user) => {
    if (!id) throw new Error('User ID is required');
    if (!user || typeof user !== 'object') throw new Error('User data is required');
    try {
        return await userRepositories.updateUser(id, user);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const deleteUser = async (id) => {
    if (!id) throw new Error('User ID is required');
    try {
        return await userRepositories.deleteUser(id);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

const findUsers = async (searchTerm, page = 1, limit = 10) => {
    if (!searchTerm) throw new Error('Search term is required');
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        page = isNaN(page) ? 1 : Math.max(1, page);
        limit = isNaN(limit) ? 10 : Math.max(1, limit);
        const offset = (page - 1) * limit;
        return await userRepositories.findUsers(searchTerm, offset, limit);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    findUsers,
    getUserByEmail,
    getUserByUserName
};