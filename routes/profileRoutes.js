import express from 'express';

import {getUserProfile, updateUserProfile} from '../controllers/profileController.js';

import {verifyToken} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken ,getUserProfile);
router.put("/", verifyToken, updateUserProfile);


export default router;