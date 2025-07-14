import db from "../models/index.js";
import logger from "../logger/logger.js";


const Workers = db.Workers;

const getAllWorkers = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const workers = await Workers.findAll({
        offset: offset,
        limit: limit
    });
    const total = await Workers.count();
    return { workers, total };
};

const getOrdersByWorkerId = async (workerId, page = 1, limit = 10) => {
    const workerOrders = await db.Workers.findAll({
        where: { id: workerId },
        include: [{
            model: db.Orders,
            as: 'orders'
        }],
        offset: (page - 1) * limit,
        limit: limit
    });
    logger.info(`Getting orders for worker with ID: ${workerId}`);
    return workerOrders;
};


export default {
    getAllWorkers,
    getOrdersByWorkerId
};