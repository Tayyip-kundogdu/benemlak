import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth, clerkClient } from "@clerk/express";
import { PropertyFilterParams } from "../db/queries";


// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Güvenli pozitif sayı alma
const parsePositiveNumber = (val: unknown): number | undefined => {
  if (val === undefined || val === null || val === "") return undefined;
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

// Tekil string alma
const parseStringParam = (val: unknown): string | undefined => {
  return typeof val === "string" ? val : undefined;
};

const LISTING_TYPES = ["satilik", "kiralik", "sezonluk_kiralik", "konut_projesi"];
const PROPERTY_TYPES = ["daire", "villa", "müstakil_ev", "arsa", "isyeri", "bina"];
const CURRENCIES = ["TRY", "USD", "EUR"];

// Clerk kullanıcısı users tablosunda yoksa Clerk'ten bilgilerini alıp ekler
// Clerk kullanıcısı users tablosunda yoksa Clerk'ten bilgilerini alıp ekler
const ensureUserExists = async (userId: string) => {
  // 🟢 1. Önce veritabanına bak
  const existing = await queries.getUserById(userId);
  if (existing) return existing; // Varsa doğrudan dön, Clerk'e yavaş istek ATMA!

  // 🟢 2. Yalnızca kullanıcı veritabanında İLK DEFA oluşturuluyorsa Clerk API'den çek
  const clerkUser = await clerkClient.users.getUser(userId);

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  return queries.upsertUser({
    id: userId,
    email: primaryEmail ?? `${userId}@no-email.local`,
    name: fullName,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
    imageUrl: clerkUser.imageUrl ?? null,
  });
};

// ---------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------

export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await queries.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ error: "Failed to get properties" });
  }
};

export const getFeaturedProperties = async (req: Request, res: Response) => {
  try {
    const rawLimit = req.query.limit;

    if (rawLimit !== undefined && typeof rawLimit !== "string") {
      res.status(400).json({ error: "Invalid limit parameter" });
      return;
    }

    const limit = parsePositiveNumber(rawLimit) ?? 6;

    const properties = await queries.getFeaturedProperties(limit);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting featured properties:", error);
    res.status(500).json({ error: "Failed to get featured properties" });
  }
};

export const getFilteredProperties = async (req: Request, res: Response) => {
  try {
    const {
      city,
      district,
      neighborhood,
      listingType,
      propertyType,
      categoryId,
      minPrice,
      maxPrice,
      minNetM2,
      maxNetM2,
      roomCount,
      isFeatured,
      searchQuery,
    } = req.query;

    const filters: PropertyFilterParams = {
      city: parseStringParam(city),
      district: parseStringParam(district),
      neighborhood: parseStringParam(neighborhood),
      listingType: parseStringParam(listingType) as PropertyFilterParams["listingType"],
      propertyType: parseStringParam(propertyType) as PropertyFilterParams["propertyType"],
      categoryId: parseStringParam(categoryId),
      minPrice: parsePositiveNumber(minPrice),
      maxPrice: parsePositiveNumber(maxPrice),
      minNetM2: parsePositiveNumber(minNetM2),
      maxNetM2: parsePositiveNumber(maxNetM2),
      roomCount: parseStringParam(roomCount),
      isFeatured:
        parseStringParam(isFeatured) !== undefined
          ? parseStringParam(isFeatured) === "true"
          : undefined,
      searchQuery: parseStringParam(searchQuery),
    };

    const properties = await queries.getFilteredProperties(filters);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error filtering properties:", error);
    res.status(500).json({ error: "Failed to filter properties" });
  }
};

export const searchPropertiesWithAI = async (req: Request, res: Response) => {
  try {
    const aiParsedParams = req.body;

    if (!aiParsedParams || typeof aiParsedParams !== "object") {
      res.status(400).json({ error: "Invalid AI filter parameters" });
      return;
    }

    const properties = await queries.searchPropertiesWithAI(aiParsedParams);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error performing AI search:", error);
    res.status(500).json({ error: "Failed to search properties with AI" });
  }
};

export const getPropertyBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const property = await queries.getPropertyBySlug(slug as string);

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error getting property by slug:", error);
    res.status(500).json({ error: "Failed to get property" });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await queries.getPropertyById(id as string);

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error getting property by ID:", error);
    res.status(500).json({ error: "Failed to get property" });
  }
};

export const getPropertyImage = async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    const image = await queries.getPropertyImageById(imageId as string);

    if (!image) {
      res.status(404).end();
      return;
    }

    const buffer = Buffer.from(image.data, "base64");

    res.set({
      "Content-Type": image.mimeType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: image.id,
      
    });

    res.send(buffer);
  } catch (error) {
    res.status(500).end();
  }
};

// ---------------------------------------------------------------------
// Protected (Danışman)
// ---------------------------------------------------------------------

// Yeni ilan oluştur
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 🟢 1. Multer ile Yüklenen Dosyaları Yakalama (artık diske değil, RAM'e - memoryStorage)
    const files = req.files as Express.Multer.File[];

    // Not: Artık "uploadedImageUrls" üretmiyoruz, çünkü URL'ler property_images
    // tablosuna insert edildikten SONRA, dönen id'lerden oluşturulacak.
    // coverImage kontrolü için sadece dosya olup olmadığına bakıyoruz.
    const hasFiles = files && files.length > 0;

    // Eski JSON/body.images fallback'i (dosya yoksa ve body'de hazır URL/base64 geldiyse) korunuyor
    let fallbackImageUrls: string[] = [];
    if (!hasFiles && req.body.images) {
      try {
        fallbackImageUrls = typeof req.body.images === "string"
          ? JSON.parse(req.body.images)
          : req.body.images;
      } catch {
        fallbackImageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      }
    }

    // coverImage zorunlu alan kontrolü için: ya dosya var, ya fallback var, ya da body.coverImage var
    const coverImage = hasFiles ? "PENDING" : (fallbackImageUrls[0] || req.body.coverImage);

    // 🟢 2. Multipart/form-data Verilerini Parse Etme
    const price = parsePositiveNumber(req.body.price);
    const netM2 = parsePositiveNumber(req.body.netM2);
    const grossM2 = parsePositiveNumber(req.body.grossM2);
    const isFeatured = req.body.isFeatured === "true" || req.body.isFeatured === true;
    const isActive = req.body.isActive === undefined ? true : (req.body.isActive === "true" || req.body.isActive === true);

    const {
      title,
      slug,
      description,
      currency,
      city,
      district,
      neighborhood,
      address,
      mapCoordinates,
      listingType,
      propertyType,
      categoryId,
      roomCount,
      buildingAge,
      floorNumber,
      totalFloors,
      heatingType,
      distances,
      features,
    } = req.body;

    // Zorunlu alan kontrolü (aynı)
    const requiredFields: Record<string, unknown> = {
      title,
      slug,
      description,
      price,
      city,
      district,
      coverImage,
      categoryId,
      listingType,
      propertyType,
    };

    const missing = Object.entries(requiredFields)
      .filter(([, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missing.length > 0) {
      res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }

    if (price === undefined) {
      res.status(400).json({ error: "price must be a valid non-negative number" });
      return;
    }

    if (!LISTING_TYPES.includes(listingType)) {
      res.status(400).json({
        error: `Invalid listingType. Allowed: ${LISTING_TYPES.join(", ")}`,
      });
      return;
    }

    if (!PROPERTY_TYPES.includes(propertyType)) {
      res.status(400).json({
        error: `Invalid propertyType. Allowed: ${PROPERTY_TYPES.join(", ")}`,
      });
      return;
    }

    if (currency !== undefined && !CURRENCIES.includes(currency)) {
      res.status(400).json({
        error: `Invalid currency. Allowed: ${CURRENCIES.join(", ")}`,
      });
      return;
    }

    // Clerk kullanıcısı users tablosunda yoksa ekle
    await ensureUserExists(userId);

    // 🟢 3. Property + Görselleri tek transaction'da oluştur
    const property = await queries.createProperty({
      title,
      slug,
      description,
      price,
      currency,
      city,
      district,
      neighborhood,
      address,
      mapCoordinates,
      listingType,
      propertyType,
      categoryId,
      coverImage, // dosya varsa queries içinde ezilecek, yoksa fallback kullanılacak
      netM2,
      grossM2,
      roomCount,
      buildingAge,
      floorNumber,
      totalFloors,
      heatingType,
      distances,
      features,
      isFeatured,
      isActive,
      images: fallbackImageUrls, // sadece dosya yokken kullanılır
      userId,
      files, // 🟢 yeni: ham dosyalar (buffer) queries'e gidiyor
    });

    res.status(201).json(property);
  } catch (error: any) {
    console.error("Error creating property:", error);

    const code = error?.code ?? error?.cause?.code;
    const constraint: string = error?.constraint ?? error?.cause?.constraint ?? "";

    if (code === "23505") {
      if (constraint.includes("email")) {
        res.status(409).json({
          error: "Bu e-posta ile users tablosunda başka bir kayıt var (Clerk id farklı).",
        });
      } else {
        res.status(409).json({ error: "Bu slug ile bir ilan zaten mevcut, başlığı değiştirin." });
      }
      return;
    }

    if (code === "23503") {
      res.status(400).json({
        error: constraint.includes("category")
          ? "Geçersiz categoryId."
          : "Kullanıcı kaydı bulunamadı (users tablosunu kontrol edin).",
      });
      return;
    }

    res.status(500).json({ error: "Failed to create property" });
  }
};

// İlan güncelle
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const existingProperty = await queries.getPropertyById(id as string);
    if (!existingProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    // 🟢 memoryStorage'dan gelen dosyalar (URL değil, buffer)
    const files = req.files as Express.Multer.File[];

    const {
      id: _id,
      userId: _userId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      images: _images, // frontend'den gelen eski/fallback images alanını çekip atıyoruz, queries kendi üretecek
      coverImage: _coverImage,
      ...rawUpdateData
    } = req.body ?? {};

    const updateData: Record<string, any> = { ...rawUpdateData };

    if (updateData.price) updateData.price = parsePositiveNumber(updateData.price);
    if (updateData.netM2) updateData.netM2 = parsePositiveNumber(updateData.netM2);
    if (updateData.grossM2) updateData.grossM2 = parsePositiveNumber(updateData.grossM2);
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === "true" || updateData.isFeatured === true;
    }

    const updatedProperty = await queries.updateProperty(id as string, updateData, files);

    res.status(200).json(updatedProperty);
  } catch (error: any) {
    console.error("Error updating property:", error);
    const code = error?.code ?? error?.cause?.code;
    if (code === "23505") {
      res.status(409).json({ error: "Bu slug ile bir ilan zaten mevcut." });
      return;
    }
    res.status(500).json({ error: "Failed to update property" });
  }
};

// İlan sil
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    const existingProperty = await queries.getPropertyById(id as string);
    if (!existingProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    await queries.deleteProperty(id as string);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
};

