import jwt from 'jsonwebtoken';
import logger from "../logger/logger.js";
import dotenv from 'dotenv';
// Middleware to authenticate JWT tokens

// In terms of authorization, the Frontend should send the JWT token in the Authorization header as a Bearer token.

dotenv.config();

export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    logger.info(`Authorization header: ${authHeader}`);

    if (!authHeader) {
        logger.error('Authorization header is missing');
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    const bearerToken = authHeader.split(' ');

    if(bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
        logger.error(`Invalid or malformed authorization header`);
        return res.status(401).json({message: 'Invalid or malformed authorization header'});
    }

    const token = bearerToken[1]; // Extract the token from the header
    logger.info(`Extracted token: ${token}`);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info(`Decoded token: ${JSON.stringify(decoded)}`);
        logger.info(`Expiration time: ${new Date(decoded.exp * 1000).toISOString()}`);
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role && req.user.role.toUpperCase() === role.toUpperCase()) {
            next(); // User has the required role
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
        }
    };
};


export default {verifyToken, requireRole}