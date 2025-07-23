// controllers/authController.js
import logger from '../logger/logger.js';
import userService from '../services/userService.js';
import dotenv from 'dotenv';
import passwordUtil from '../security/passwordUtil.js';
import { sendEmail } from '../services/emailService.js';
import { generateToken } from '../security/TokenGenerator.js';
import JWTProvider from '../security/JWTProvider.js';

dotenv.config();


export const registerUser = async (req, res) => {
    try {
        logger.info('Registering new user');
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        const [userByUsername, userByEmail] = await Promise.all([
            userService.getUserByUserName(username),
            userService.getUserByEmail(email)
        ]);

        if (userByUsername && userByEmail) {
            logger.warn(`User with username: ${username} and email: ${email} already exists`);
            return res.status(409).json({ message: 'Username and email already exist' });
        }
        if (userByUsername) {
            logger.warn(`User with username: ${username} already exists`);
            return res.status(409).json({ message: 'Username already exists' });
        }
        if (userByEmail) {
            logger.warn(`User with email: ${email} already exists`);
            return res.status(409).json({ message: 'Email already exists' });
        }

        logger.info(`No existing user found with username: ${username} or email: ${email}`);
        const hashedPassword = await passwordUtil.hashPassword(password);
        logger.info(`Registering user with username: ${username}, email: ${email}`);
        const user = await userService.createUser({
            username,
            email,
            password: hashedPassword,
            role
        });

        logger.info(`User registered successfully with ID: ${user.id}`);

        // Generate a verification token
        const verificationToken = generateToken();

        // Send email verification
        logger.info(`Sending verification email to: ${email}`);
        await sendEmail(user.email, verificationToken);
        logger.info(`Verification email sent to: ${email}`);

        // Store the verification token in the database
        const now = new Date();
        const expirationTime = Number(process.env.VERIFICATION_TOKEN_EXPIRATION || 10) * 60 * 1000;
        const tokenExpiration = new Date(now.getTime() + expirationTime);
        logger.info(`Verification token generated at: ${now}`);
        logger.info(`Verification token expiration time: ${tokenExpiration}`);
        await userService.insertVerificationToken(user.id, verificationToken, tokenExpiration);

        logger.info('Verification token stored in database');
        return res.status(201).json({ message: 'User registered. Please verify your email.' });
    } catch (error) {
        logger.error('Error registering user', error);
        if (error && error.errno === 1265) {
            return res.status(401).json({ message: 'Bad request' });
        }
        return res.status(500).json({ error: 'Registration failed' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        logger.info('Login attempt:', {
            hasUsername: !!username,
            hasEmail: !!email,
            hasPassword: !!password
        });

        if (!username && !email) {
            return res.status(400).json({ message: 'Username or email is required' });
        }
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Password is required.' });
        }

        const decodedEmail = email ? Buffer.from(email, 'base64').toString('utf-8') : null;
        const decodedUsername = username ? Buffer.from(username, 'base64').toString('utf-8') : null;
        const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');
        logger.info('Username:' + decodedUsername);
        logger.info('Email:' + decodedEmail);
        logger.info('Password:' + decodedPassword);

        if (!decodedPassword) {
            return res.status(400).json({ message: 'Password is required' });
        }

        let user;
        if (decodedUsername) {
            user = await userService.getUserByUserName(decodedUsername);
        } else if (decodedEmail) {
            user = await userService.getUserByEmail(decodedEmail);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = JWTProvider.generateJWT(user);
        return res.status(200).json({ accessToken: token });
    } catch (error) {
        logger.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};

export const logoutUser = async (req, res) => {
    logger.info('Logging out user');
    return res.status(200).json({ message: 'User logged out successfully' });
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const expiry = new Date();
        const user = await userService.findByVerificationToken(token, expiry);
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        const verification_date = new Date();
        await userService.verifyUser(user.id, verification_date);
        return res.status(200).send('Email verified successfully!');
    } catch (error) {
        logger.error('Error verifying email', error);
        return res.status(500).json({ message: 'Error verifying email', error });
    }
};

export const loginWorker = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: 'Password is required.' });
        }
        if (!username && !email) {
            return res.status(400).json({ message: 'Username or email is required' });
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
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (!user.role || user.role.toUpperCase() !== 'WORKER') {
            return res.status(401).json({ message: 'Not a worker account' });
        }
        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = JWTProvider.generateJWT(user);
        return res.status(200).json({ accessToken: token });
    } catch (error) {
        logger.error('Worker login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};