import express from 'express';
import {
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser, deleteUser
} from '../controllers/userController.js';

import {verifyToken, requireRole} from "../middleware/authMiddleware.js"; // Import
// authentication middleware

const router = express.Router();

router.get('/' ,verifyToken, requireRole('ADMIN') ,getAllUsers);
router.get('/email/:email', verifyToken, getUserByEmail);
router.get('/id/:id', verifyToken, getUserById);
router.put('/id/:id', verifyToken, updateUser);
router.delete('/id/:id', verifyToken, deleteUser);

export default router;