import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// 1. Get active FAQs for visitors (Public)
export const getActiveFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await queries.getActiveFaqs();
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error getting active FAQs:", error);
    res.status(500).json({ error: "Sıkça sorulan sorular getirilemedi." });
  }
};

// 2. Get ALL FAQs including inactive ones (Protected - Admin/Consultant Only)
export const getAllFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await queries.getAllFaqs();
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Error getting all FAQs:", error);
    res.status(500).json({ error: "Tüm SSS verileri getirilemedi." });
  }
};

// 3. Create a new FAQ entry (Protected - Consultant Only)
export const createFaq = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { question, answer, order, isActive } = req.body;

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

// 4. Update an existing FAQ entry (Protected - Consultant Only)
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;

    const updatedFaq = await queries.updateFaq(id as string, {
      question,
      answer,
      order,
      isActive,
    });

    res.status(200).json(updatedFaq);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(500).json({ error: "SSS güncellenirken bir hata oluştu." });
  }
};

// 5. Delete a FAQ entry (Protected - Consultant Only)
export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedFaq = await queries.deleteFaq(id as string);

    res.status(200).json(deletedFaq);
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ error: "SSS silinirken bir hata oluştu." });
  }
};