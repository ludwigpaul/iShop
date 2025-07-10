import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import nodemailer from "nodemailer";
import passwordUtil from "../security/passwordUtil.js";


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
        const verificationToken = crypto.randomBytes(32).toString('hex');

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

        // Log the received data (without password)
        logger.info('Login attempt:', {
            hasUsername: !!username,
            hasEmail: !!email,
            hasPassword: !!password
        });

        if (!password) {
            // Handle error, e.g. return a response or throw
            return res.status(400).json({ error: 'Password is required.' });
        }

        if (typeof password !== 'string') {
            // Handle error, e.g. return a response or throw
            return res.status(400).json({ error: 'Password is required.' });
        }

        const hash = Buffer.from(password);
        const decodedEmail = (email)?Buffer.from(email, 'base64').toString('utf-8'): null;
        const decodedUsername = (username)?Buffer.from(username, 'base64').toString('utf-8'):null;
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

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await userService.findByVerificationToken(token);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        await userService.verifyUser(user.id);
        res.status(200).send('Email verified successfully!');
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error });
    }
};

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