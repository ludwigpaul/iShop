import {logger} from "../logger/logger.js";
import userService from "../services/userService.js";
import passwordUtil from "../security/passwordUtil.js";

export const getUserProfile = async (req, res) => {

    const userId = req.user.userId; // user ID is stored in req.user after authentication
    logger.info(`Fetching user profile for user ID: ${userId}`);
    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({
            username: user.username,
            email: user.email
        });
    } catch (error) {
        logger.error("Error fetching user profile", error);
        res.status(500).json({message: "Error fetching user profile", error});
    }
};

export const updateUserProfile = async (req, res) => {
    const userId = req.user.userId; // user ID is stored in req.user after authentication
    logger.info(`Fetching user profile for user ID: ${userId}. ${JSON.stringify(req.body)}`);
    const { username, email, currentPassword, newPassword } = req.body;

    logger.info(`Updating user profile for user ID: ${userId}`, { username, email });

    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        // Check if current password is provided and matches the user's password
        if (currentPassword && !(await userService.loginUser(user.username, currentPassword))) {
            return res.status(401).json({message: "Current password is incorrect"});
        }

        // Update user data
        const updatedData = { username, email };
        if (newPassword) {
            updatedData.password = await passwordUtil.hashPassword(newPassword); // Hash the new password before saving
            logger.info("Updated password for user ID:" + updatedData.password);
        }

        const updatedUser = await userService.updateUser(userId, updatedData);
        res.status(200).json({message: "Profile updated successfully", user: updatedUser});
    } catch (error) {
        logger.error("Error updating user profile", error);
        res.status(500).json({message: "Error updating profile", error});
    }
};