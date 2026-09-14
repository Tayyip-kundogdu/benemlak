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

const router = Router();

// GET /api/categories - Tüm kategorileri/ilan tiplerini getir (Public)
router.get("/", categoryController.getAllCategories);

// GET /api/categories/:id - ID'ye göre tek kategori getir (Public)
router.get("/:id", categoryController.getCategoryById);

// POST /api/categories - Yeni kategori oluştur (Protected - Sadece Danışman)
router.post("/", requireAuth(), categoryController.createCategory);

// PUT /api/categories/:id - Kategori güncelle (Protected - Sadece Danışman)
router.put("/:id", requireAuth(), categoryController.updateCategory);

// DELETE /api/categories/:id - Kategori sil (Protected - Sadece Danışman)
router.delete("/:id", requireAuth(), categoryController.deleteCategory);

export default router;