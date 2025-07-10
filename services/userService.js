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

const loginUser = async (username, password) => {
    return await userRepositories.getUserByUserName(username, password);
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

const findByVerificationToken = async (token) => {
    return await userRepositories.findByVerificationToken(token);
};

const verifyUser = async (id) => {
    return await userRepositories.verifyUser(id);
};

const getAllWorkers = async () => {
    return await userRepositories.getAllWorkers();
};

const assignOrderToWorker = async (orderId, workerId) => {
    return await userRepositories.assignOrderToWorker(orderId, workerId);
};

const getOrdersByWorker = async (workerId) => {
    return await userRepositories.getOrdersByWorker(workerId);
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    getUserByUserName,
    getUserByEmail,
    updateUser,
    deleteUser,
    findUsers,
    findByVerificationToken,
    verifyUser,
    getAllWorkers,
    assignOrderToWorker,
    getOrdersByWorker
};


