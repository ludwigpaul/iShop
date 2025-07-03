import userRepositories from "../repositories/userRepositories.js";

// The service for managing users in the ishop database.
// The purpose of this service is to provide functions for CRUD operations on users.

const getAllUsers = async () => {
    return await userRepositories.getAllUsers();
}

const getUserById = async (id) => {
    return await userRepositories.getUserById(id);
}

const createUser = async (user) => {
    return await userRepositories.createUser(user);
}

//Gets user by username
const getUserByUserName = async (username) => {
    return await userRepositories.getUserByUserName(username);
}

const getUserByEmail = async (email) => {
    return await userRepositories.getUserByEmail(email);
}

const updateUser = async (id, user) => {
    return await userRepositories.updateUser(id, user);
}

const deleteUser = async (id) => {
    return await userRepositories.deleteUser(id);
}

const findUsers = async (searchTerm) => {
    return await userRepositories.findUsers(searchTerm);
}

export default {
    getAllUsers,
    getUserById,
    createUser,
    getUserByUserName,
    getUserByEmail,
    updateUser,
    deleteUser,
    findUsers
};


