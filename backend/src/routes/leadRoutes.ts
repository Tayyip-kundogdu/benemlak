import { Router } from "express";
import * as leadController from "../controllers/leadController";
import { requireAuth } from "@clerk/express";
import { requireAdvisor } from "../middleware/requireAdvisor";

const router = Router();

// Ziyaretçilerin form doldurması (Üyeliksiz / Public)
router.post("/", leadController.createLead);

// Danışmanın gelen mesajları panellerinde görmesi (Protected)
router.get("/", requireAuth(), requireAdvisor, leadController.getAllLeads);

// Danışmanın mesaj durumunu "contacted" veya "closed" yapması (Protected)
router.patch("/:id/status", requireAuth(), requireAdvisor, leadController.updateLeadStatus);




export default router;