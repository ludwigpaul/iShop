import express from "express";
import categoryController from "../controllers/categoryController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", categoryController.getAllCategories);
router.get("/id/:id", categoryController.getCategoryById);
router.post("/", requireRole('admin'), categoryController.createCategory);
router.put("/id/:id", requireRole('admin'), categoryController.updateCategory);
router.delete("/id/:id", requireRole('admin'), categoryController.deleteCategory);
router.get("/search", categoryController.findCategories);

export default router;