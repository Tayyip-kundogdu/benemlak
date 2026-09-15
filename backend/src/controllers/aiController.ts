import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import {
  searchPropertiesWithAI,
  type PropertyFilterParams,
  type ListingType,
  type PropertyType,
} from "../db/queries";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

if (!GEMINI_API_KEY) {
  console.warn("[aiController] GEMINI_API_KEY tanımlı değil, AI arama çalışmayacak.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// schema.ts'teki enum değerleriyle birebir aynı olmalı
const LISTING_TYPES: ListingType[] = [
  "satilik",
  "kiralik",
  "sezonluk_kiralik",
  "konut_projesi",
];
const PROPERTY_TYPES: PropertyType[] = [
  "daire",
  "villa",
  "müstakil_ev",
  "arsa",
  "isyeri",
  "bina",
];

const SYSTEM_PROMPT = `
Sen bir emlak sitesi için doğal dil arama asistanısın. Kullanıcının Türkçe yazdığı
serbest metni analiz edip, SADECE aşağıdaki alanlara sahip geçerli bir JSON nesnesi
döndüreceksin. Kullanıcının belirtmediği alanları JSON'a hiç ekleme (null/boş string yazma).

JSON alanları:
- city: string (il, örn: "İstanbul")
- district: string (ilçe, örn: "Kadıköy")
- neighborhood: string (mahalle)
- listingType: sadece şu değerlerden biri -> ${LISTING_TYPES.join(", ")}
  (satılık istekleri -> "satilik", kiralık -> "kiralik", yazlık/sezonluk kiralık -> "sezonluk_kiralik",
   proje/lansman -> "konut_projesi")
- propertyType: sadece şu değerlerden biri -> ${PROPERTY_TYPES.join(", ")}
  (daire, villa, müstakil ev, arsa, işyeri/ofis/dükkan -> "isyeri", bina)
- minPrice: number (TL)
- maxPrice: number (TL)
- minNetM2: number
- maxNetM2: number
- roomCount: string (örn: "2+1", "3+1")
- searchQuery: string (yukarıdaki alanlara oturmayan, serbest anahtar kelimeler; örn: "deniz manzaralı", "havuzlu")

Kurallar:
- Kullanıcı "500 bin TL'ye kadar" derse maxPrice=500000 olarak yaz (sayıyı Türkçe yazımdan (bin, milyon) çevir).
- Kullanıcı "en az 3 oda" gibi belirsiz bir şey derse roomCount'a en yakın değeri yaz (örn "3+1").
- Emin olmadığın alanları JSON'a hiç ekleme.
- Cevabın SADECE JSON olsun, başka hiçbir açıklama, markdown ya da metin ekleme.
`.trim();

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Gemini'den gelen ham JSON'u güvenli PropertyFilterParams'a çeviriyoruz.
// Enum dışı bir değer, negatif sayı ya da yanlış tip gelirse o alanı sessizce atlıyoruz.
function sanitizeFilters(raw: unknown): PropertyFilterParams {
  const filters: PropertyFilterParams = {};
  if (!raw || typeof raw !== "object") return filters;
  const r = raw as Record<string, unknown>;

  if (typeof r.city === "string" && r.city.trim()) filters.city = r.city.trim();
  if (typeof r.district === "string" && r.district.trim()) filters.district = r.district.trim();
  if (typeof r.neighborhood === "string" && r.neighborhood.trim())
    filters.neighborhood = r.neighborhood.trim();

  if (typeof r.listingType === "string" && LISTING_TYPES.includes(r.listingType as ListingType)) {
    filters.listingType = r.listingType as ListingType;
  }
  if (typeof r.propertyType === "string" && PROPERTY_TYPES.includes(r.propertyType as PropertyType)) {
    filters.propertyType = r.propertyType as PropertyType;
  }

  if (typeof r.minPrice === "number" && r.minPrice >= 0) filters.minPrice = r.minPrice;
  if (typeof r.maxPrice === "number" && r.maxPrice >= 0) filters.maxPrice = r.maxPrice;
  if (typeof r.minNetM2 === "number" && r.minNetM2 >= 0) filters.minNetM2 = r.minNetM2;
  if (typeof r.maxNetM2 === "number" && r.maxNetM2 >= 0) filters.maxNetM2 = r.maxNetM2;

  if (typeof r.roomCount === "string" && r.roomCount.trim()) filters.roomCount = r.roomCount.trim();
  if (typeof r.searchQuery === "string" && r.searchQuery.trim())
    filters.searchQuery = r.searchQuery.trim();

  // min > max gibi ters gelmiş değerleri düzelt
  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
  }

  return filters;
}

export const aiPropertySearch = async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "'message' alanı zorunludur (kullanıcının doğal dil sorgusu).",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Sunucuda GEMINI_API_KEY tanımlı değil.",
      });
    }

    const aiResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nKullanıcı mesajı: "${message}"` }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const rawText = aiResponse.text ?? "";
    const parsed = extractJson(rawText);
    const filters = sanitizeFilters(parsed);

    const properties = await searchPropertiesWithAI(filters);

    return res.status(200).json({
      success: true,
      query: message,
      appliedFilters: filters,
      resultCount: properties.length,
      properties,
    });
  } catch (error) {
    console.error("[aiPropertySearch] Hata:", error);
    return res.status(500).json({
      success: false,
      message: "AI arama sırasında bir hata oluştu.",
    });
  }
};