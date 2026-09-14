/*
import { Request, Response } from "express";
import {
  createProperty,
  getAllProperties,
  getFeaturedProperties,
  getPropertyBySlug,
  getPropertyById,
  getFilteredProperties,
  searchPropertiesWithAI,
  updateProperty,
  deleteProperty,
  type PropertyFilterParams,
} from "../db/queries";

// ==========================================
// İLAN (PROPERTY) CONTROLLER
// queries.ts içindeki fonksiyonları HTTP katmanına bağlar
// ==========================================

// query string'den gelen filtreleri PropertyFilterParams'a dönüştürür
// (Express'te req.query her zaman string/undefined gelir, tipleri elle çeviriyoruz)
const parseFilterParams = (query: Request["query"]): PropertyFilterParams => {
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
  } = query;

  return {
    city: city as string | undefined,
    district: district as string | undefined,
    neighborhood: neighborhood as string | undefined,
    listingType: listingType as PropertyFilterParams["listingType"],
    propertyType: propertyType as PropertyFilterParams["propertyType"],
    categoryId: categoryId as string | undefined,
    minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    minNetM2: minNetM2 !== undefined ? Number(minNetM2) : undefined,
    maxNetM2: maxNetM2 !== undefined ? Number(maxNetM2) : undefined,
    roomCount: roomCount as string | undefined,
    isFeatured:
      isFeatured !== undefined ? isFeatured === "true" : undefined,
    searchQuery: searchQuery as string | undefined,
  };
};

// GET /properties
export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await getAllProperties();
    return res.status(200).json(properties);
  } catch (error) {
    console.error("getProperties error:", error);
    return res
      .status(500)
      .json({ message: "İlanlar getirilirken bir hata oluştu." });
  }
};

// GET /properties/featured?limit=6
export const getFeatured = async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const parsedLimit = limit !== undefined ? Number(limit) : undefined;
    const properties = await getFeaturedProperties(parsedLimit);
    return res.status(200).json(properties);
  } catch (error) {
    console.error("getFeatured error:", error);
    return res
      .status(500)
      .json({ message: "Öne çıkan ilanlar getirilirken bir hata oluştu." });
  }
};

// GET /properties/filter?city=...&minPrice=...&maxPrice=...
export const filterProperties = async (req: Request, res: Response) => {
  try {
    const filters = parseFilterParams(req.query);
    const properties = await getFilteredProperties(filters);
    return res.status(200).json(properties);
  } catch (error) {
    console.error("filterProperties error:", error);
    return res
      .status(500)
      .json({ message: "İlanlar filtrelenirken bir hata oluştu." });
  }
};

// POST /properties/ai-search
// Body: { query: string } -> önce LLM ile PropertyFilterParams'a çevrilip buraya gönderilir
// (hepsiAI tarzı doğal dil araması: parse işlemi ayrı bir servis katmanında yapılıp
// buraya hazır aiParsedParams olarak gelmesi önerilir)
export const aiSearchProperties = async (req: Request, res: Response) => {
  try {
    const aiParsedParams: PropertyFilterParams = req.body;
    const properties = await searchPropertiesWithAI(aiParsedParams);
    return res.status(200).json(properties);
  } catch (error) {
    console.error("aiSearchProperties error:", error);
    return res
      .status(500)
      .json({ message: "AI araması sırasında bir hata oluştu." });
  }
};

// GET /properties/slug/:slug (SEO dostu URL)
export const getPropertyBySlugHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;
    const property = await getPropertyBySlug(slug as string);

    if (!property) {
      return res.status(404).json({ message: "İlan bulunamadı." });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.error("getPropertyBySlugHandler error:", error);
    return res
      .status(500)
      .json({ message: "İlan getirilirken bir hata oluştu." });
  }
};

// GET /properties/:id
export const getProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await getPropertyById(id as string);

    if (!property) {
      return res.status(404).json({ message: "İlan bulunamadı." });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.error("getProperty error:", error);
    return res
      .status(500)
      .json({ message: "İlan getirilirken bir hata oluştu." });
  }
};

// POST /properties
export const createPropertyHandler = async (req: Request, res: Response) => {
  try {
    const newProperty = await createProperty(req.body);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error("createPropertyHandler error:", error);
    return res
      .status(500)
      .json({ message: "İlan oluşturulurken bir hata oluştu." });
  }
};

// PUT /properties/:id
export const updatePropertyHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProperty = await updateProperty(id as string, req.body);
    return res.status(200).json(updatedProperty);
  } catch (error: any) {
    console.error("updatePropertyHandler error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "İlan bulunamadı." });
    }
    return res
      .status(500)
      .json({ message: "İlan güncellenirken bir hata oluştu." });
  }
};

// DELETE /properties/:id
export const deletePropertyHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProperty = await deleteProperty(id as string);
    return res
      .status(200)
      .json({ message: "İlan silindi.", property: deletedProperty });
  } catch (error: any) {
    console.error("deletePropertyHandler error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "İlan bulunamadı." });
    }
    return res
      .status(500)
      .json({ message: "İlan silinirken bir hata oluştu." });
  }
};*/

import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";
import { PropertyFilterParams } from "../db/queries";

// Tüm aktif ilanları getir (Public)
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const properties = await queries.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({ error: "Failed to get properties" });
  }
};

// Öne çıkan ilanları getir (Public)
export const getFeaturedProperties = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 6;
    const properties = await queries.getFeaturedProperties(limit);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error getting featured properties:", error);
    res.status(500).json({ error: "Failed to get featured properties" });
  }
};

// Dinamik filtreleme ve arama parametreleriyle ilanları getir (Public)
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

    const filters = {
      city: city as string | undefined,
      district: district as string | undefined,
      neighborhood: neighborhood as string | undefined,
      listingType: listingType as PropertyFilterParams["listingType"],
      propertyType: propertyType as PropertyFilterParams["propertyType"],
      categoryId: categoryId as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minNetM2: minNetM2 ? Number(minNetM2) : undefined,
      maxNetM2: maxNetM2 ? Number(maxNetM2) : undefined,
      roomCount: roomCount as string | undefined,
      isFeatured: isFeatured !== undefined ? isFeatured === "true" : undefined,
      searchQuery: searchQuery as string | undefined,
    };

    const properties = await queries.getFilteredProperties(filters);
    res.status(200).json(properties);
  } catch (error) {
    console.error("Error filtering properties:", error);
    res.status(500).json({ error: "Failed to filter properties" });
  }
};

// hepsiAI Esnek Arama Entegrasyonu (Public)
export const searchPropertiesWithAI = async (req: Request, res: Response) => {
  try {
    const aiParsedParams = req.body;

    // Body boş ise veya uygun nesne verilmediyse hata dön
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

// Slug ile İlan Detayı Getir (Public)
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

// ID ile İlan Detayı Getir (Public)
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

// Yeni İlan Oluştur (Protected - Sadece Danışman)
// src/controllers/propertyController.ts

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
      city,
      district,
      neighborhood,
      listingType,
      propertyType,
      categoryId,
      coverImage,
      netM2,
      grossM2,
      roomCount,
      buildingAge,
      floorNumber, // 🟢 floorLocation yerine floorNumber
      totalFloors, // 🟢 Ek olarak toplam kat sayısı
      heatingType, // 🟢 heating yerine heatingType
      isFeatured,
      images,
    } = req.body;

    if (!title || !slug || !price || !city || !district || !coverImage || !categoryId) {
      res.status(400).json({
        error: "Title, slug, price, city, district, coverImage, and categoryId are required",
      });
      return;
    }

    const property = await queries.createProperty({
      title,
      slug,
      description,
      price,
      city,
      district,
      neighborhood,
      listingType,
      propertyType,
      categoryId,
      coverImage,
      netM2,
      grossM2,
      roomCount,
      buildingAge,
      floorNumber, // 🟢 Doğru alan adı
      totalFloors, // 🟢 Şemada tanımlı alan
      heatingType, // 🟢 Doğru alan adı
      isFeatured,
      images,
      userId,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
};

// İlan Güncelle (Protected - Sadece Danışman)
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // İlanın varlığını kontrol et
    const existingProperty = await queries.getPropertyById(id as string);
    if (!existingProperty) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    const updatedProperty = await queries.updateProperty(id as string, req.body);

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
};

// İlan Sil (Protected - Sadece Danışman)
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // İlanın varlığını kontrol et
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