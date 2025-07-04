import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import bcrypt from "bcryptjs";

import dotenv from 'dotenv';

import jwt from 'jsonwebtoken';


dotenv.config();

// Registers a new user
export const registerUser = async (req, res) => {
    try {
        logger.info("Registering new user");
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        // Use promise all to ensure both username and email checks are done concurrently
        const [userByUsername, userByEmail] = await Promise.all([
            userService.getUserByUserName(username),
            userService.getUserByEmail(email)
        ]);

        if(userByUsername && userByEmail) {
            logger.warn(`User with username: ${username} and email: ${email} already exists`);
            return res.status(409).json({ message: "Username and email already exist" });
        }

        if (userByUsername) {
            logger.warn(`User with username: ${username} already exists`);
            return res.status(409).json({ message: "Username already exists" });
        }

        if (userByEmail) {
            logger.warn(`User with email: ${email} already exists`);
            return res.status(409).json({ message: "Email already exists" });
        }

        logger.info(`No existing user found with username: ${username} or email: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        logger.info(`Registering user with username: ${username}, email: ${email}`);
        const user = await userService.createUser({ username, email, password: hashedPassword, role });
        return res.status(201).json({
            userId: user.id,
            message: "User registered successfully"
        });


    } catch (error) {
        logger.error("Error registering user", error);

        if (error.errno === 1265) {
            return res.status(401).json({ message: "Bad request" });
        }

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
            return await authenticateUser(user, password, res);
        } else {
            const user = await userService.getUserByEmail(email);
            return await authenticateUser(user, password, res);
        }

    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

export const logoutUser = async (req, res) => {
  logger.info(`Logging out user`);
};

async function authenticateUser(user, password, res) {
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email , role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    logger.info(`User authenticated successfully with username: ${user.username} and email: ${user.email}`);
    logger.info(`Generated JWT token for user: ${user.username}. Token: ${token}`);
    return res.status(200).json({ accessToken: token , message: "Login" +
            " successful"});
}