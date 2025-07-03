// controllers/userController.js
import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import bcrypt from "bcryptjs";



// Registers a new user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        logger.info(hashedPassword);
        const user = await userService.createUser({ username, email, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
};

// Logs in a user with username and password
export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (!username && !email) {
            return res.status(400).json({ message: "Username or email is required" });
        }

        if (username && email) {
            return res.status(400).json({ message: "Please provide either username or email, not both" });
        }

        if (username) {
            const user = await userService.getUserByUserName(username);
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (email){
            const user = await userService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Here you would typically generate a JWT token and send it back
        res.status(200).json({ message: "Login successful"});
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

//Logs in a user with email and password
export const loginUserByEmail = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await userService.getUserByEmailAndPassword(email, password);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Here you would typically generate a JWT token and send it back
        res.status(200).json({ message: "Login successful", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

// Gets all users
export const getAllUsers = async (req, res) => {
    try {
        logger.info("Getting all users");
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error });
    }
};

// Gets a user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Getting user with ID: ${id}`);
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error });
    }
};

// Gets user by email
export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        logger.info(`Getting user with email: ${email}`);
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error });
    }
};

// Updates a user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.body;
        logger.info(`Updating user with ID: ${id}`, user);

        if (user.password){
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user.password = hashedPassword;
        }

        if (!user.username || !user.email) {
            return res.status(400).json({ message: "Username and email are required" });
        }
        const updatedUser = await userService.updateUser(id, user);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};

// Deletes a user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Deleting user with ID: ${id}`);
        const result = await userService.deleteUser(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

// Finds users by search term
export const findUsers = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        logger.info(`Finding users with search term: ${searchTerm}`);
        const users = await userService.findUsers(searchTerm);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error finding users", error });
    }
};

