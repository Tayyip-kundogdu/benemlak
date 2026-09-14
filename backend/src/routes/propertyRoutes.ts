/*
import { Router } from "express";
import {
  getProperties,
  getFeatured,
  filterProperties,
  aiSearchProperties,
  getPropertyBySlugHandler,
  getProperty,
  createPropertyHandler,
  updatePropertyHandler,
  deletePropertyHandler,
} from "../controllers/propertyController";
// import { requireAdmin } from "../middleware/auth"; // tek danışman paneli için öneri

const router = Router();

// ⚠️ Sıralama önemli: sabit path'ler (/featured, /filter, /ai-search, /slug/:slug)
// dinamik /:id route'undan ÖNCE tanımlanmalı, yoksa Express onları id sanıp yakalar.

// Herkese açık (üyeliksiz ziyaretçi) uçları
router.get("/", getProperties);
router.get("/featured", getFeatured);
router.get("/filter", filterProperties);
router.post("/ai-search", aiSearchProperties);
router.get("/slug/:slug", getPropertyBySlugHandler);
router.get("/:id", getProperty);
*/
// Sadece admin/danışman paneli için
//router.post("/", /* requireAdmin, */ createPropertyHandler);
//router.put("/:id", /* requireAdmin, */ updatePropertyHandler);
//router.delete("/:id", /* requireAdmin, */ deletePropertyHandler);

//export default router;


import { Router } from "express";
import * as propertyController from "../controllers/propertyController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/properties - Tüm aktif ilanları getir (Public)
router.get("/", propertyController.getAllProperties);

// GET /api/properties/featured - Öne çıkan ilanları getir (Public)
router.get("/featured", propertyController.getFeaturedProperties);

// GET /api/properties/filter - Dinamik filtreleme ve arama (Public)
router.get("/filter", propertyController.getFilteredProperties);

// POST /api/properties/ai-search - hepsiAI esnek metin tabanlı arama (Public)
router.post("/ai-search", propertyController.searchPropertiesWithAI);

// GET /api/properties/slug/:slug - SEO dostu URL ile ilan detayı getir (Public)
router.get("/slug/:slug", propertyController.getPropertyBySlug);

// GET /api/properties/:id - ID ile ilan detayı getir (Public)
router.get("/:id", propertyController.getPropertyById);

// POST /api/properties - Yeni ilan ekle (Protected - Sadece Danışman)
router.post("/", requireAuth(), propertyController.createProperty);

// PUT /api/properties/:id - İlan güncelle (Protected - Sadece Danışman)
router.put("/:id", requireAuth(), propertyController.updateProperty);

// DELETE /api/properties/:id - İlan sil (Protected - Sadece Danışman)
router.delete("/:id", requireAuth(), propertyController.deleteProperty);

export default router;