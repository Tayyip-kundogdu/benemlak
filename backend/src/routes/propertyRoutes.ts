import { Router } from "express";
import * as propertyController from "../controllers/propertyController";
import { requireAuth } from "@clerk/express";
import { upload } from '../middleware/uploadMiddleware';

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


router.get("/images/:imageId", propertyController.getPropertyImage);


// GET /api/properties/:id - ID ile ilan detayı getir (Public)
router.get("/:id", propertyController.getPropertyById);

// 🟢 POST /api/properties - Yeni ilan ekle (Protected - Multer Çoklu Dosya Yükleme Destekli)
router.post("/", requireAuth(), upload.array('images', 10), propertyController.createProperty);

// PUT /api/properties/:id - İlan güncelle (Protected - Sadece Danışman)
router.put("/:id", requireAuth(), upload.array('images', 10), propertyController.updateProperty);

// DELETE /api/properties/:id - İlan sil (Protected - Sadece Danışman)
router.delete("/:id", requireAuth(), propertyController.deleteProperty);



export default router;