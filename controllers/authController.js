import logger from "../logger/logger.js";
import userService from "../services/userService.js";
import dotenv from 'dotenv';
import passwordUtil from "../security/passwordUtil.js";
import {sendEmail} from "../services/emailService.js";
import {generateToken} from "../security/TokenGenerator.js";
import JWTProvider from "../security/JWTProvider.js";


dotenv.config();

// Registers a new user
export const registerUser = async (req, res) => {
    try {
        logger.info("Registering new user");
        const {username, email, password, role} = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({message: "Username, email, and password are required"});
        }

        // Use promise all to ensure both username and email checks are done concurrently
        const [userByUsername, userByEmail] = await Promise.all([
            userService.getUserByUserName(username),
            userService.getUserByEmail(email)
        ]);

        if (userByUsername && userByEmail) {
            logger.warn(`User with username: ${username} and email: ${email} already exists`);
            return res.status(409).json({message: "Username and email already exist"});
        }

        if (userByUsername) {
            logger.warn(`User with username: ${username} already exists`);
            return res.status(409).json({message: "Username already exists"});
        }

        if (userByEmail) {
            logger.warn(`User with email: ${email} already exists`);
            return res.status(409).json({message: "Email already exists"});
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
        await sendEmail(user.email, verificationToken)
            .then(() => {
                logger.info(`Verification email sent to: ${email}`);

                // Store the verification token in the database
                const now = new Date();
                const expirationTime = Number(process.env.VERIFICATION_TOKEN_EXPIRATION) * 60 * 1000; // 15 minutes
                const tokenExpiration = new Date(now.getTime() + expirationTime); // Token valid for 24 hours
                logger.info(`Verification token generated at: ${now}`);
                logger.info(`Verification token expiration time: ${tokenExpiration}`);
                userService.insertVerificationToken(user.id, verificationToken, tokenExpiration);
            })
            .then(() => {
                logger.info(`Verification token stored in database`);
                res.status(201).json({message: "User registered. Please verify your email."});
            });

    } catch (error) {
        logger.error("Error registering user", error);

        if (error.errno === 1265) {
            return res.status(401).json({message: "Bad request"});
        }

        res.status(500).json({error: "Registration failed"});
    }
};

// Logs in a user with username and password
export const loginUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        // Log the received data (without password)
        logger.info('Login attempt:', {
            hasUsername: !!username,
            hasEmail: !!email,
            hasPassword: !!password
        });

        if (!username && !email) {
            return res.status(400).json({message: "Username or email is required"});
        }

        if (!password) {
            // Handle error, e.g. return a response or throw
            return res.status(400).json({error: 'Password is required.'});
        }

        if (typeof password !== 'string') {
            // Handle error, e.g. return a response or throw
            return res.status(400).json({error: 'Password is required.'});
        }

        const decodedEmail = (email) ? Buffer.from(email, 'base64').toString('utf-8') : null;
        const decodedUsername = (username) ? Buffer.from(username, 'base64').toString('utf-8') : null;
        const decodedPassword = Buffer.from(password, 'base64').toString('utf-8');
        logger.info('Username:' + decodedUsername);
        logger.info('Email:' + decodedEmail);
        logger.info('Password:' + decodedPassword);

        if (!decodedPassword) {
            return res.status(400).json({message: "Password is required"});
        }


        let user;
        if (decodedUsername) {
            user = await userService.getUserByUserName(decodedUsername);
        } else if (decodedEmail) {
            user = await userService.getUserByEmail(decodedEmail);
        }

        if (!user) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = JWTProvider.generateJWT(user);

        res.status(200).json({
            accessToken: token
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({error: "Login failed"});
    }
};

// Logs out a user
// Invalidate the JWT token on the client side
export const logoutUser = async (req, res) => {
    logger.info(`Logging out user`);
    // Invalidate the JWT token on the client side
    res.status(200).json({message: "User logged out successfully"});
};

// Verifies a user's email using a token
export const verifyEmail = async (req, res) => {
    try {
        const {token} = req.query;
        const expiry = new Date();
        const user = await userService.findByVerificationToken(token, expiry);
        if (!user) {
            return res.status(400).json({message: 'Invalid or expired token'});
        }
        const verification_date = new Date();
        await userService.verifyUser(user.id, verification_date);
        res.status(200).send('Email verified successfully!');
    } catch (error) {
        res.status(500).json({message: 'Error verifying email', error});
    }
};

//TODO: Use the same logic as loginUser for worker login and admin login
export const loginWorker = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        if (!password || typeof password !== 'string') {
            return res.status(400).json({error: 'Password is required.'});
        }

        if(!username && !email) {
            return res.status(400).json({message: "Username or email is required"});
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
            return res.status(401).json({message: "Invalid credentials"});
        }
        if (!user.role || user.role.toUpperCase() !== 'WORKER') {
            return res.status(401).json({message: "Not a worker account"});
        }
        const passwordMatch = await passwordUtil.comparePasswords(decodedPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({message: "Invalid credentials"});
        }
        const token = JWTProvider.generateJWT(user);
        res.status(200).json({
            accessToken: token
        });
    } catch (error) {
        logger.error('Worker login error:', error);
        res.status(500).json({error: "Login failed"});
    }
};