import express from "express";
import cors from "cors";
import path from "path";

import { ENV } from "./config/env";
import { clerkMiddleware } from "@clerk/express";

import propertyRoutes from "./routes/propertyRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import leadRoutes from "./routes/leadRoutes";
import faqsRoutes from "./routes/faqsRoutes";

const app = express();

// Frontend bağlantısı ve Cookie yetkilendirmesi
app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));

// Auth nesnesini req'e ekler (Admin paneli ilan ekleme/düzenleme kontrolleri için)
app.use(clerkMiddleware()); 

app.use(express.json()); // JSON istekleri
app.use(express.urlencoded({ extended: true })); // Form verileri

// Health Check ve API Bilgisi
app.get("/api/health", (req, res) => {
  res.json({
    message: "Welcome to Portfolio Real Estate API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
    endpoints: {
      properties: "/api/properties", // İlan listeleme, detay, filtreleme
      categories: "/api/categories", // Satılık, Kiralık, Sezonluk vb.
      leads: "/api/leads",           // Müşteri iletişim/teklif formları               // hepsiAI benzeri akıllı arama/öneri motoru
      faqs: "/api/faqs",             // Sıkça Sorulan Sorular
    },
  });
});

// Route Tanımlamaları
app.use("/api/properties", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/faqs", faqsRoutes); // Sıkça Sorulan Sorular için route

// Production Build Servisi (SPA Routing)
if (ENV.NODE_ENV === "production") {
  const __dirname = path.resolve();

  // Frontend build dosyalarını servis et
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // React Router için tüm bilinmeyen yönlendirmeleri index.html'e aktar
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}



app.listen(ENV.PORT, () => console.log("Real Estate Server running on PORT:", ENV.PORT));