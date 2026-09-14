import { db } from "./index";
import { eq, and, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";
import {
  properties,
  users,
  categories,
  leads,
  faqs,
  type NewProperty,
  type NewUser,
  type NewCategory,
  type NewLead,
  type NewFaq,
} from "./schema";

// Enum değerlerinin tiplerini infer ediyoruz
export type ListingType = typeof properties.$inferSelect.listingType;
export type PropertyType = typeof properties.$inferSelect.propertyType;

export interface PropertyFilterParams {
  city?: string;
  district?: string;
  neighborhood?: string;
  listingType?: ListingType;
  propertyType?: PropertyType;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minNetM2?: number;
  maxNetM2?: number;
  roomCount?: string;
  isFeatured?: boolean;
  searchQuery?: string;
}

// ==========================================
// 1️⃣ USER QUERIES (Clerk Sync & Admin)
// ==========================================

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
};

export const upsertUser = async (data: NewUser) => {
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: data,
    })
    .returning();
  return user;
};

// ==========================================
// 2️⃣ CATEGORY QUERIES
// ==========================================

// ==========================================
// 2️⃣ CATEGORY QUERIES (Eksikler Tamamlandı)
// ==========================================

export const getAllCategories = async () => {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
};

export const getCategoryById = async (id: string) => {
  return db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
};

export const createCategory = async (data: NewCategory) => {
  const [category] = await db.insert(categories).values(data).returning();
  return category;
};

type CategoryUpdate = Partial<NewCategory>;

export const updateCategory = async (id: string, data: CategoryUpdate) => {
  const [updatedCategory] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();

  if (!updatedCategory) {
    throw new Error(`Category with id ${id} not found`);
  }

  return updatedCategory;
};

export const deleteCategory = async (id: string) => {
  const [deletedCategory] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deletedCategory) {
    throw new Error(`Category with id ${id} not found`);
  }

  return deletedCategory;
};

// ==========================================
// 3️⃣ PROPERTY QUERIES (Emlak İlanları)
// ==========================================

export const createProperty = async (data: NewProperty) => {
  const [property] = await db.insert(properties).values(data).returning();
  return property;
};

// Tüm aktif ilanlar (Kategori ve Danışman bilgisiyle)
export const getAllProperties = async () => {
  return db.query.properties.findMany({
    where: eq(properties.isActive, true),
    with: {
      category: true,
      user: true,
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
};

// Öne çıkan ilanlar (Ana sayfa vitrini)
export const getFeaturedProperties = async (limit = 6) => {
  return db.query.properties.findMany({
    where: and(eq(properties.isActive, true), eq(properties.isFeatured, true)),
    with: {
      category: true,
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    limit,
  });
};

// Slug ile İlan Detayı Getirme (SEO Dostu URL için)
export const getPropertyBySlug = async (slug: string) => {
  return db.query.properties.findFirst({
    where: eq(properties.slug, slug),
    with: {
      category: true,
      user: true,
    },
  });
};

// ID ile İlan Detayı Getirme
export const getPropertyById = async (id: string) => {
  return db.query.properties.findFirst({
    where: eq(properties.id, id),
    with: {
      category: true,
      user: true,
    },
  });
};

// Dinamik Filtreleme ve Arama Sorgusu
export const getFilteredProperties = async (filters: PropertyFilterParams) => {
  const conditions = [eq(properties.isActive, true)];

  if (filters.city) {
    conditions.push(ilike(properties.city, `%${filters.city}%`));
  }

  if (filters.district) {
    conditions.push(ilike(properties.district, `%${filters.district}%`));
  }

  if (filters.neighborhood) {
    conditions.push(ilike(properties.neighborhood, `%${filters.neighborhood}%`));
  }

  if (filters.listingType) {
    conditions.push(eq(properties.listingType, filters.listingType));
  }

  if (filters.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType));
  }

  if (filters.categoryId) {
    conditions.push(eq(properties.categoryId, filters.categoryId));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(properties.price, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(properties.price, filters.maxPrice));
  }

  if (filters.minNetM2 !== undefined) {
    conditions.push(gte(properties.netM2, filters.minNetM2));
  }

  if (filters.maxNetM2 !== undefined) {
    conditions.push(lte(properties.netM2, filters.maxNetM2));
  }

  if (filters.roomCount) {
    conditions.push(eq(properties.roomCount, filters.roomCount));
  }

  if (filters.isFeatured !== undefined) {
    conditions.push(eq(properties.isFeatured, filters.isFeatured));
  }

  // Arama Çubuğu (Başlık, Açıklama ve İlçe üzerinde esnek arama)
  if (filters.searchQuery) {
    conditions.push(
      sql`(${ilike(properties.title, `%${filters.searchQuery}%`)} OR ${ilike(
        properties.description,
        `%${filters.searchQuery}%`
      )} OR ${ilike(properties.district, `%${filters.searchQuery}%`)})`
    );
  }

  return db.query.properties.findMany({
    where: and(...conditions),
    with: {
      category: true,
      user: true,
    },
    orderBy: (properties, { desc }) => [desc(properties.createdAt)],
  });
};

// hepsiAI Esnek Arama Entegrasyonu Yardımcısı
export const searchPropertiesWithAI = async (aiParsedParams: PropertyFilterParams) => {
  return getFilteredProperties(aiParsedParams);
};

type PropertyUpdate = Partial<
  Omit<NewProperty, "id" | "createdAt" | "updatedAt">
>;
export const updateProperty = async (id: string, data: Partial<NewProperty>) => {
  // ✅ Doğrudan update et ve sonucunu kontrol et
  const [updatedProperty] = await db
    .update(properties)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(properties.id, id))
    .returning();

  if (!updatedProperty) {
    throw new Error(`Property with id ${id} not found`);
  }

  return updatedProperty;
};

export const deleteProperty = async (id: string) => {
  const [deletedProperty] = await db
    .delete(properties)
    .where(eq(properties.id, id))
    .returning();

  if (!deletedProperty) {
    throw new Error(`Property with id ${id} not found`);
  }

  return deletedProperty;
};

// ==========================================
// 4️⃣ LEAD QUERIES (Müşteri İletişim Formları)
// ==========================================

export const createLead = async (data: NewLead) => {
  const [lead] = await db.insert(leads).values(data).returning();
  return lead;
};

export const getAllLeads = async () => {
  return db.query.leads.findMany({
    with: {
      property: true,
    },
    orderBy: (leads, { desc }) => [desc(leads.createdAt)],
  });
};

export const updateLeadStatus = async (id: string, status: string) => {
  const [lead] = await db
    .update(leads)
    .set({ status })
    .where(eq(leads.id, id))
    .returning();
  return lead;
};

// ==========================================
// 5️⃣ FAQ QUERIES (Sıkça Sorulan Sorular)
// ==========================================

export const getActiveFaqs = async () => {
  return db.query.faqs.findMany({
    where: eq(faqs.isActive, true),
    orderBy: (faqs, { asc }) => [asc(faqs.order)],
  });
};

export const createFaq = async (data: NewFaq) => {
  const [faq] = await db.insert(faqs).values(data).returning();
  return faq;
};