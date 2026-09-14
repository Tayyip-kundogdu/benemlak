import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export function requireAdvisor(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Giriş yapmalısınız." });
  }

  if (userId !== process.env.ADVISOR_CLERK_USER_ID) {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }

  next();
}