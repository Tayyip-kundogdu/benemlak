import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Get active FAQs for visitors (Public)
export const getActiveFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await queries.getActiveFaqs();
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error getting FAQs:", error);
    res.status(500).json({ error: "Sıkça sorulan sorular getirilemedi." });
  }
};

// Create a new FAQ entry (Protected - Consultant Only)
export const createFaq = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { question, answer, order, isActive } = req.body;

    // Schema notNull alan kontrolleri
    if (!question || !answer) {
      res.status(400).json({ 
        error: "Soru (question) ve Cevap (answer) alanları zorunludur." 
      });
      return;
    }

    const faq = await queries.createFaq({
      question,
      answer,
      order: order ?? 0,
      isActive: isActive ?? true,
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res.status(500).json({ error: "Soru eklenirken bir hata oluştu." });
  }
};