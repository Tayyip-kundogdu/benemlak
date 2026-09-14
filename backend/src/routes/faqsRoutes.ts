import { Router } from "express";
import * as faqController from "../controllers/faqController";
import { requireAuth } from "@clerk/express";
import { requireAdvisor } from "../middleware/requireAdvisor";

const router = Router();

// GET /api/faqs -> Aktif SSS listesini getir (Public - Ziyaretçiler için)
router.get("/", faqController.getActiveFaqs);

// POST /api/faqs -> Yeni SSS ekle (Protected - Sadece Danışman)
router.post("/", requireAuth(), requireAdvisor, faqController.createFaq);

export default router;