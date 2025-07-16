import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

export const generateJWT = (user) => {
    if (!user || !user.id || !user.email || !user.role) {
        throw new Error("User object with id, role and email is required to generate JWT");
    }

    return jwt.sign(
        {id: user.id, role: user.role.toLowerCase()},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRATION}
    );

};

export const generateJWTForAdmin = (user) => {
    if (!user || !user.id || !user.email || !user.role) {
        throw new Error("User object with id, role and email is required to generate JWT for admin");
    }

    return jwt.sign(
        {id: user.id, role: user.role.toLowerCase()},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_ADMIN_EXPIRATION}
    );
}

export const verifyJWT = (token) => {
    if (!token) {
        throw new Error("Token is required for verification");
    }

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}

export default {generateJWT, generateJWTForAdmin, verifyJWT};