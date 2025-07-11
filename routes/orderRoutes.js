import express from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, completeOrder } from "../controllers/orderController.js";

const router = express.Router();
// CRUD operations for orders
// This file defines the routes for managing orders in the iShop application.

router.get("/", getAllOrders);
router.get("/id/:id", getOrderById);
router.get("/user/:userId", createOrder);
router.post("/checkout", createOrder);
router.post('/complete/:orderId', completeOrder);
router.put("/id/:id", updateOrder);
router.delete("/id/:id", deleteOrder);

export default router;