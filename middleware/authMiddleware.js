import jwt from 'jsonwebtoken';
import logger from "../logger/logger.js";
// Middleware to authenticate JWT tokens

// In terms of authorization, the Frontend should send the JWT token in the Authorization header as a Bearer token.

export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    logger.info(`Authorization header: ${authHeader}`);

    if (!authHeader) {
        logger.error('Authorization header is missing');
        return res.status(401).json({ message: 'Authorization header is required' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token from the header
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
        if (req.user && req.user.role.toUpperCase() === role.toUpperCase()) {
            next(); // User has the required role
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
        }
    };
};


export default {verifyToken, requireRole}