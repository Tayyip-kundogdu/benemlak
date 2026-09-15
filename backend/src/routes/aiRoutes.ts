import { Router } from "express";
import { aiPropertySearch } from "../controllers/aiController";

const router = Router();

// POST /api/ai/search
// body: { "message": "kadıköy'de 3+1 deniz manzaralı 5 milyona kadar kiralık daire" }
router.post("/search", aiPropertySearch);

export default router;