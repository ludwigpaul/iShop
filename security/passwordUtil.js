import bcrypt from "bcryptjs";

export const hashPassword = async (password) => {
    if (!password) {
        throw new Error("Password is required for hashing");
    }

    // Hash the password using bcrypt with a salt rounds of 10
    // This is a common practice to ensure the password is securely hashed
    return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hashedPassword) => {
    if (!password || !hashedPassword) {
        throw new Error("Both password and hashed password are required for comparison");
    }

    // Compare the plain password with the hashed password
    return await bcrypt.compare(password, hashedPassword);
};

export default {hashPassword, comparePasswords};
