import express from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, completeOrder } from "../controllers/orderController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllOrders);
router.get("/id/:id", getOrderById);
router.get("/user/:userId", createOrder);
router.post("/checkout", createOrder);
router.post('/complete/:orderId', requireRole('worker'), completeOrder);
router.put("/id/:id", requireRole('admin'), updateOrder);
router.delete("/id/:id", requireRole('admin'), deleteOrder);

export default router;