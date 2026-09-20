import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth, clerkClient } from "@clerk/express";
import { PropertyFilterParams } from "../db/queries";

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

// Güvenli pozitif sayı alma
const parsePositiveNumber = (val: unknown): number | undefined => {
  if (typeof val !== "string") return undefined;
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

// Tekil string alma (dizi olarak gönderilen parametreleri engellemek için)
const parseStringParam = (val: unknown): string | undefined => {
  return typeof val === "string" ? val : undefined;
};

const LISTING_TYPES = ["satilik", "kiralik", "sezonluk_kiralik", "konut_projesi"];
const PROPERTY_TYPES = ["daire", "villa", "müstakil_ev", "arsa", "isyeri", "bina"];
const CURRENCIES = ["TRY", "USD", "EUR"];

// Clerk kullanıcısı users tablosunda yoksa Clerk'ten bilgilerini alıp ekler
const ensureUserExists = async (userId: string) => {
  const existing = await queries.getUserById(userId);
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(userId);

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  return queries.upsertUser({
    id: userId,
    email: primaryEmail ?? `${userId}@no-email.local`, // email notNull + unique
    name: fullName,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
    imageUrl: clerkUser.imageUrl ?? null,
  });
};

// ---------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------

// Tüm aktif ilanları getir
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await queries.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ error: "Failed to get properties" });
  }
};

// Öne çıkan ilanlar
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

// Dinamik filtreleme ve arama
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

// hepsiAI esnek arama entegrasyonu
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

// Slug ile ilan detayı
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

// ID ile ilan detayı
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

    const {
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
      coverImage,
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
      images,
    } = req.body;

    // Zorunlu alan kontrolü: hangi alan eksikse mesajda söylenir
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

    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
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

    // 🟢 Clerk kullanıcısı users tablosunda yoksa otomatik ekle
    await ensureUserExists(userId);

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
      coverImage,
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
      images: Array.isArray(images) ? images : [],
      userId,
    });

    res.status(201).json(property);
  } catch (error: any) {
    console.error("Error creating property:", error);

    // Postgres hataları: 23505 = unique ihlali, 23503 = foreign key ihlali
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

    // Değiştirilmemesi gereken alanları body'den ayıkla
    const {
      id: _id,
      userId: _userId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...updateData
    } = req.body ?? {};

    const updatedProperty = await queries.updateProperty(id as string, updateData);

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