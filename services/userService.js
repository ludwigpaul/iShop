// services/userService.js
import userRepositories from '../repositories/userRepository.js';

const getAllUsers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return await userRepositories.getAllUsers(offset, limit);
};

const getUserById = async (id) => {
    return await userRepositories.getUserById(id);
};

const getUserByEmail = async (email) => {
    return await userRepositories.getUserByEmail(email);
};

const getUserByUserName = async (username) => {
    return await userRepositories.getUserByUserName(username);
};

const createUser = async (user) => {
    return await userRepositories.createUser(user);
};

const updateUser = async (id, user) => {
    return await userRepositories.updateUser(id, user);
};

const deleteUser = async (id) => {
    return await userRepositories.deleteUser(id);
};

const findUsers = async (searchTerm, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return await userRepositories.findUsers(searchTerm, offset, limit);
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