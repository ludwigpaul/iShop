import userRepository from '../repositories/userRepositories.js';
import bcrypt from 'bcryptjs';

// Login user
export async function loginUser(req, res) {
    const { username, password } = req.body;

    try {
        const user = await userRepository.getUserByUserName(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token or handle session (if applicable)
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Register user
export async function registerUser(req, res) {
    const { username, email, password } = req.body;

    try {
        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepository.createUser({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}