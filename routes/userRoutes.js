import express from 'express';
import {
    registerUser,
    loginUser,
    loginWorker,
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser, deleteUser
} from '../controllers/userController.js';

import {verifyToken, requireRole} from "../middleware/authMiddleware.js";
import userService from '../services/userService.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/worker/login', loginWorker);
router.get('/' , verifyToken, requireRole('ADMIN') , getAllUsers);
router.get('/email/:email', verifyToken, getUserByEmail);
router.get('/id/:id', verifyToken, getUserById);
router.put('/id/:id', verifyToken, updateUser);
router.delete('/id/:id', verifyToken, deleteUser);
router.get('/verify-email', async (req, res) => {
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
});

export default router;