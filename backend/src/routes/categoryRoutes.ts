/*
import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "../controllers/categoryController";
// import { requireAdmin } from "../middleware/auth"; // tek danışman paneli için öneri
 
const router = Router();
 
// Herkese açık (ziyaretçi arama/filtreleme kategorileri görsün diye)
router.get("/", getCategories);
router.get("/:id", getCategory);
 
// Sadece admin/danışman paneli için (üyeliksiz ziyaretçi bunlara erişemesin)
//router.post("/", /* requireAdmin, */ //createCategoryHandler);
//router.put("/:id", /* requireAdmin, */ updateCategoryHandler);
//router.delete("/:id", /* requireAdmin, */ deleteCategoryHandler);
 
//export default router;
 
import { Router } from "express";
import * as categoryController from "../controllers/categoryController";
import { requireAuth } from "@clerk/express";
import { requireAdvisor } from "../middleware/requireAdvisor";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

router.post("/", requireAuth(), requireAdvisor, categoryController.createCategory);
router.put("/:id", requireAuth(), requireAdvisor, categoryController.updateCategory);
router.delete("/:id", requireAuth(), requireAdvisor, categoryController.deleteCategory);

export default router;