import { Router } from "express";
import * as leadController from "../controllers/leadController";
import { requireAuth } from "@clerk/express";

const router = Router();

// Ziyaretçilerin form doldurması (Üyeliksiz / Public)
router.post("/", leadController.createLead);

// Danışmanın gelen mesajları panellerinde görmesi (Protected)
router.get("/", requireAuth(), leadController.getAllLeads);

// Danışmanın mesaj durumunu "contacted" veya "closed" yapması (Protected)
router.patch("/:id/status", requireAuth(), leadController.updateLeadStatus);

export default router;