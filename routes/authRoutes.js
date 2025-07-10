import express from 'express';
import { loginUser, loginWorker , registerUser, logoutUser , verifyEmail } from '../controllers/authController.js';

const router = express.Router();

// The purpose of this file is to define the authentication routes for the application.
router.get('/verify-email' , verifyEmail);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.post('/login/worker', loginWorker);

export default router;