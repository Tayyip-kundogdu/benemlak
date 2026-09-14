import { Router } from "express";
import * as faqController from "../controllers/faqController";
import { requireAuth } from "@clerk/express";

const router = Router();

// GET /api/faqs -> Aktif SSS listesini getir (Public - Ziyaretçiler için)
router.get("/", faqController.getActiveFaqs);

// POST /api/faqs -> Yeni SSS ekle (Protected - Sadece Danışman)
router.post("/", requireAuth(), faqController.createFaq);

export default router;