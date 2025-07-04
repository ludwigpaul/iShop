import express from "express";
import orderController from "../controllers/orderController.js";

const router = express.Router();
// CRUD operations for orders
// This file defines the routes for managing orders in the iShop application.

router.get("/", orderController.getAllOrders);
router.get("/id/:id", orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/id/:id", orderController.updateOrder);
router.delete("/id/:id", orderController.deleteOrder);

export default router;