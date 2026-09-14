import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// POST /api/leads -> Ziyaretçilerin iletişim/teklif formu göndermesi (Public)
export const createLead = async (req: Request, res: Response) => {
  try {
    const { fullName, name, email, phone, message, propertyId } = req.body;

    // Front-end'den 'fullName' veya 'name' gelse de yakala
    const leadName = fullName || name;

    // Zorunlu alan kontrolü (schema.ts notNull alanları)
    if (!leadName || !email || !phone || !message) {
      res.status(400).json({ 
        error: "Ad Soyad, E-posta, Telefon ve Mesaj alanları zorunludur." 
      });
      return;
    }

    const lead = await queries.createLead({
      fullName: leadName,
      email,
      phone,
      message,
      propertyId: propertyId || null,
      status: "new", // Schema default "new"
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "İletişim talebi oluşturulamadı." });
  }
};

// GET /api/leads -> Tüm gelen müşteri taleplerini listele (Protected - Sadece Danışman)
export const getAllLeads = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const leads = await queries.getAllLeads();
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error getting leads:", error);
    res.status(500).json({ error: "Talepler getirilirken hata oluştu." });
  }
};

// PATCH /api/leads/:id/status -> Talebin durumunu güncelle (Protected - Sadece Danışman)
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    const { status } = req.body; // "new", "contacted", "closed"

    if (!status) {
      res.status(400).json({ error: "Durum (status) bilgisi zorunludur." });
      return;
    }

    const updatedLead = await queries.updateLeadStatus(id as string, status);

    if (!updatedLead) {
      res.status(404).json({ error: "İlgili talep bulunamadı." });
      return;
    }

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ error: "Talep durumu güncellenemedi." });
  }
};