import express from "express";
import productController from "../controllers/productController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/id/:id", productController.getProductById);
router.get("/search", productController.findProducts);
router.post("/", verifyToken, requireRole('admin'), productController.createProduct);
router.put("/id/:id", verifyToken, requireRole('admin'), productController.updateProduct);
router.delete("/id/:id", verifyToken, requireRole('admin'), productController.deleteProduct);

export default router;