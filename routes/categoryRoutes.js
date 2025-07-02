import express from "express";

const router = express.Router();
import categoryController from "../controllers/categoryController.js";

//CRUD operations for categories
router.get("/", categoryController.getAllCategories);
router.get("/id/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/id/:id", categoryController.updateCategory);
router.delete("/id/:id", categoryController.deleteCategory);
router.get("/search", categoryController.findCategories);

export default router;