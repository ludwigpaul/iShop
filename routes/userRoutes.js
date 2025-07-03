import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser, deleteUser
} from '../controllers/userController.js';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/' , getAllUsers);
router.get('/email/:email', getUserByEmail);
router.get('/id/:id', getUserById);
router.put('/id/:id', updateUser);
router.delete('/id/:id', deleteUser);

export default router;