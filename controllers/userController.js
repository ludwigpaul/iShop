import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passwordUtil from "../security/passwordUtil.js";

// Gets all users
export const getAllUsers = async (req, res) => {
    try {
        logger.info("Getting all users");
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: "Error retrieving users", error});
    }
};

// Gets a user by ID
export const getUserById = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Getting user with ID: ${id}`);
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Error retrieving user", error});
    }
};

// Gets user by email
export const getUserByEmail = async (req, res) => {
    try {
        const {email} = req.params;
        logger.info(`Getting user with email: ${email}`);
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Error retrieving user", error});
    }
};

// Updates a user
export const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = req.body;
        logger.info(`Updating user with ID: ${id}`, user);

        const authenticatedUser = req.user; // Assuming user is authenticated and user info is in req.user
        logger.info(`Authenticated user: ${authenticatedUser.userId} with role: ${authenticatedUser.role}`);

        if (parseInt(authenticatedUser.userId) !== parseInt(id)) {
            return res.status(403).json({message: "You are not authorized to update this user"});
        }

        if (user.password) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
        }

        if (!user.username && !user.email) {
            return res.status(400).json({
                message: "Username or email are" +
                    " required"
            });
        }
        const updatedUser = await userService.updateUser(id, user);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({message: "Error updating user", error});
    }
};

// Deletes a user
export const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Deleting user with ID: ${id}`);

        const authenticatedUser = req.user; // Assuming user is authenticated and user info is in req.user
        logger.info(`Authenticated user: ${authenticatedUser.userId} with role: ${authenticatedUser.role}`);

        if (parseInt(authenticatedUser.userId) !== parseInt(id)) {
            return res.status(403).json({message: "You are not authorized to update this user"});
        }

        const result = await userService.deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({message: "Error deleting user", error});
    }
};

// Finds users by search term
export const findUsers = async (req, res) => {
    try {
        const {searchTerm} = req.query;
        logger.info(`Finding users with search term: ${searchTerm}`);
        const users = await userService.findUsers(searchTerm);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: "Error finding users", error});
    }
};

