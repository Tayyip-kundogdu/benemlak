import { Router } from "express";
import * as faqController from "../controllers/faqController";
import { requireAuth } from "@clerk/express";
import { requireAdvisor } from "../middleware/requireAdvisor";

const router = Router();

// GET /api/faqs -> Aktif SSS listesini getir (Public - Ziyaretçiler için)
router.get("/", faqController.getActiveFaqs);

// GET /api/faqs/admin -> Tüm SSS listesini getir (Protected - Danışman Paneli için)
router.get("/admin", requireAuth(), requireAdvisor, faqController.getAllFaqs);

// POST /api/faqs -> Yeni SSS ekle (Protected - Sadece Danışman)
router.post("/", requireAuth(), requireAdvisor, faqController.createFaq);

// PUT /api/faqs/:id -> SSS güncelle (Protected - Sadece Danışman)
router.put("/:id", requireAuth(), requireAdvisor, faqController.updateFaq);

// DELETE /api/faqs/:id -> SSS sil (Protected - Sadece Danışman)
router.delete("/:id", requireAuth(), requireAdvisor, faqController.deleteFaq);

export default router;