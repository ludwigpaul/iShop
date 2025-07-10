import userRepository from '../repositories/userRepositories.js';
import jwt from 'jsonwebtoken';

export async function loginAdmin(req, res) {
    try {
        const { username, password } = req.body;
        const user = await userRepository.findByUsername(username);
        if (!user || user.role.toUpperCase() !== 'ADMIN' || !(await userRepository.comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials or not an admin' });
        }
        const token = jwt.sign({ id: user.id, role: user.role.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function assignOrder(req, res) {
    try {
        const { orderId, workerId } = req.body;
        await userService.assignOrderToWorker(orderId, workerId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to assign order' });
    }
}

// Get all workers
export async function getWorkers(req, res) {
    try {
        const workers = await userService.getAllWorkers();
        res.json(workers);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
}

// Get orders assigned to a worker
export async function getWorkerOrders(req, res) {
    try {
        const { workerId } = req.params;
        const orders = await userService.getOrdersByWorker(workerId);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch worker orders' });
    }
}