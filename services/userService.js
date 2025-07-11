import userRepositories from "../repositories/userRepositories.js";

// The service for managing users in the ishop database.
// The purpose of this service is to provide functions for CRUD operations on users.

// The service layer is responsible for business logic and interacts with the repository layer to perform database operations.

// This gets all users from the database.
const getAllUsers = async () => {
    return await userRepositories.getAllUsers();
}

// Gets a user by ID
const getUserById = async (id) => {
    return await userRepositories.getUserById(id);
}

// Creates a new user
const createUser = async (user) => {
    return await userRepositories.createUser(user);
}

//Gets user by username
const getUserByUserName = async (username) => {
    return await userRepositories.getUserByUserName(username);
}

// Gets user by email
const getUserByEmail = async (email) => {
    return await userRepositories.getUserByEmail(email);
}

// Updates a user by ID
const updateUser = async (id, user) => {
    return await userRepositories.updateUser(id, user);
}

// Deletes a user by ID
const deleteUser = async (id) => {
    return await userRepositories.deleteUser(id);
}

// Finds users by search term (username or email)
const findUsers = async (searchTerm) => {
    return await userRepositories.findUsers(searchTerm);
}

// Finds a user by verification token
const findByVerificationToken = async (token, expiry) => {
    return await userRepositories.findByVerificationToken(token, expiry);
};

// Verifies a user by ID
const verifyUser = async (id, verification_date) => {
    return await userRepositories.verifyUser(id, verification_date);
};

// Gets all workers (users with role 'WORKER')
// This function retrieves all users who are assigned the 'WORKER' role.
// TODO: Implement pagination and filtering
const getAllWorkers = async () => {
    return await userRepositories.getAllWorkers();
};

// Assigns an order to a worker
const assignOrderToWorker = async (orderId, workerId) => {
    return await userRepositories.assignOrderToWorker(orderId, workerId);
};

// Gets all orders assigned to a specific worker
// TODO: Implement pagination and filtering
const getOrdersByWorker = async (workerId) => {
    return await userRepositories.getOrdersByWorker(workerId);
};

// Gets an admin user by username
const getAdminByUsername = async (username) => {
    return await userRepositories.getAdminByUsername(username);
};

const insertVerificationToken = async (id, token, timeStamp) => {
    return await userRepositories.insertVerificationToken(id, token, timeStamp);
}

export default {
    getAllUsers,
    getUserById,
    createUser,
    getUserByUserName,
    getUserByEmail,
    updateUser,
    deleteUser,
    findUsers,
    findByVerificationToken,
    verifyUser,
    getAllWorkers,
    assignOrderToWorker,
    getOrdersByWorker,
    getAdminByUsername,
    insertVerificationToken
};


