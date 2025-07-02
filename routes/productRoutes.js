import express from "express";
import productController from "../controllers/productController.js";

const router = express.Router();

// CRUD operations for products
// This file defines the routes for managing products in the iShop application.
router.get("/", productController.getAllProducts);
router.get("/id/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/id/:id", productController.updateProduct);
router.delete("/id/:id", productController.deleteProduct);
router.get("/search", productController.findProducts);

export default router;
