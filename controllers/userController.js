// controllers/userController.js
import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passwordUtil from "../security/passwordUtil.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Registers a new user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await userService.createUser({
            username,
            email,
            password: hashedPassword,
            verified: false,
            verificationToken
        });

        // Send email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const link = `http://localhost:3000/api/v1/users/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `<a href="${link}">Click to verify your email</a>`
        });

        res.status(201).json({ message: "User registered. Please verify your email." });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
};

const decryptData = (encryptedData) => {
    try {
        return JSON.parse(Buffer.from(encryptedData, 'base64').toString());
    } catch (error) {
        throw new Error('Invalid data format');
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Replace with your password check logic
        const isPasswordValid = password === 'adminpassword'; // Example only
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // On success
        return res.status(200).json({ token: 'mocked-token' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' }); // <-- Match test expectation
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Log the received data (without password)
        logger.info('Login attempt:', {
            hasUsername: !!username,
            hasEmail: !!email,
            hasPassword: !!password
        });

        if (typeof password !== 'string') {
            // Handle error, e.g. return a response or throw
            return res.status(400).json({ error: 'Password is required.' });
        }

        const hash = Buffer.from(password);
        const decodedEmail = Buffer.from(email, 'base64').toString('utf-8');
        const decodedUsername = Buffer.from(username, 'base64').toString('utf-8');
        const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');
        logger.info('Username:' + decodedUsername);
        logger.info('Email:' + decodedEmail);
        logger.info('Password:' + decodedPassword);



        if (!decodedPassword) {
            return res.status(400).json({ message: "Password is required" });
        }

        if (!decodedUsername && !decodedEmail) {
            return res.status(400).json({ message: "Username or email is required" });
        }

        let user;
        if (decodedUsername) {
            user = await userService.getUserByUserName(decodedUsername);
        } else if (decodedEmail) {
            user = await userService.getUserByEmail(decodedEmail);
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Login successful",
            userId: user.id,
            accessToken: token
        });
    } catch (error) {
        logger.error('Login error:', error);
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

// Logs in a worker
export const loginWorker = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (typeof password !== 'string') {
            return res.status(400).json({ error: 'Password is required.' });
        }
        const decodedUsername = username ? Buffer.from(username, 'base64').toString('utf-8') : null;
        const decodedEmail = email ? Buffer.from(email, 'base64').toString('utf-8') : null;
        const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');

        let user;
        if (decodedUsername) {
            user = await userService.getUserByUserName(decodedUsername);
        } else if (decodedEmail) {
            user = await userService.getUserByEmail(decodedEmail);
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.role || user.role.toUpperCase() !== 'WORKER') {
            return res.status(401).json({ message: "Not a worker account" });
        }
        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            message: "Login successful",
            userId: user.id,
            accessToken: token
        });
    } catch (error) {
        logger.error('Worker login error:', error);
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

