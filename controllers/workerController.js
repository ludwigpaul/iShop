import orderRepository from '../repositories/orderRepository.js';
import workerRepository from '../repositories/workerRepository.js';

export const getAllWorkers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { workers, total } = await workerRepository.getAllWorkers(page, limit);
    res.json({ workers, total, page, limit });
};

// Complete a worker's assigned order (no email)
export const completeWorkerOrder = async (req, res) => {
    const { workerId, orderId } = req.params;
    try {
        // Optionally: Check if the order belongs to this worker
        // const order = await orderRepository.getOrderById(orderId);
        // if (order.worker_id !== Number(workerId)) {
        //     return res.status(403).json({ error: 'Not authorized for this order' });
        // }

        await orderRepository.completeOrder(orderId);

        res.json({ success: true });
    } catch (err) {
        console.error('Worker order completion error:', err);
        res.status(500).json({ error: 'Failed to complete order' });
    }
};

// Get all orders assigned to a worker
export const getWorkerOrders = async (req, res) => {
    const workerId = req.params.workerId;
    try {
        const orders = await orderRepository.getOrdersByWorkerId(workerId);
        res.json(orders);
    } catch (err) {
        console.error('Fetch worker orders error:', err);
        res.status(500).json({ error: 'Failed to fetch worker orders' });
    }
};
