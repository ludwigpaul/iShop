import express from 'express';
import { loginUser, loginWorker, registerUser, logoutUser, verifyEmail } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/login/worker', loginWorker);
router.post('/logout', verifyToken, logoutUser);

export default router;