// src/middlewares/requireAdvisor.ts
import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { ENV } from "../config/env";

export const requireAdvisor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Clerk API üzerinden kullanıcının bilgilerini çek
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    // .env dosyasındaki izinli e-postaları al
    const allowedEmails = (process.env.ALLOWED_ADVISOR_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (!userEmail || !allowedEmails.includes(userEmail.toLowerCase())) {
      res.status(403).json({ error: "Forbidden: You are not authorized to perform this action" });
      return;
    }

    next();
  } catch (error) {
    console.error("Advisor auth check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};