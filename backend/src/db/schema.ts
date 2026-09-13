import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core"

// 🔴 Emlak İlanı ve Portföy Türü Enum Yapıları
export const listingTypeEnum = pgEnum("listing_type", [
  "satilik",
  "kiralik",
  "sezonluk_kiralik",
  "konut_projesi",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "daire",
  "villa",
  "müstakil_ev",
  "arsa",
  "isyeri",
  "bina",
]);



// 1️⃣ Users (Danışman / Admin)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk UserId
  email: text("email").notNull().unique(),
  name: text("name"),
  phone: text("phone"),
  imageUrl: text("image_url"),
  bio: text("bio"),
  socialLinks: jsonb("social_links").$type<{
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
    youtube?: string;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 2️⃣ Categories (Satılık, Kiralık, Proje vb.)
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // örn: Satılık Konut, Lüks Villa Projeleri
  slug: text("slug").notNull().unique(), // örn: satilik-konut
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const currencyEnum = pgEnum("currency", ["TRY", "USD", "EUR"]);
// 3️⃣ Properties (Emlak İlanları)
export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  
  // Fiyat ve Listeleme Detayları
  //price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  price: integer("price").notNull(),
  currency: currencyEnum("currency").notNull().default("TRY"), // TRY, USD, EUR
  listingType: listingTypeEnum("listing_type").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  
  // Konum Detayları (Filtreleme ve Mesafe Analizi İçin)
  city: text("city").notNull(),
  district: text("district").notNull(),
  neighborhood: text("neighborhood"),
  address: text("address"),
  mapCoordinates: jsonb("map_coordinates").$type<{ lat: number; lng: number }>(),

  // Gayrimenkul Özellikleri
  roomCount: text("room_count"), // "2+1", "3+1", "Arsa" vb.
  grossM2: integer("gross_m2"),
  netM2: integer("net_m2"),
  buildingAge: integer("building_age"),
  floorNumber: integer("floor_number"),
  totalFloors: integer("total_floors"),
  heatingType: text("heating_type"), // Kombi, Merkezi, Yerden Isıtma

  // Mesafeler (Merkez, Deniz, Okul vb. km/metre cinsinden JSON)
  distances: jsonb("distances").$type<{
    cityCenterKm?: number;
    seaMeters?: number;
    hospitalKm?: number;
    airportKm?: number;
    publicTransportMeters?: number;
  }>(),

  // Ek Özellikler (Havuz, Otopark, Balkon, Site İçinde vb.)
  features: jsonb("features").$type<string[]>(),

  // Görseller ve Durum
  coverImage: text("cover_image").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]), // Galeri fotoğrafları
  isFeatured: boolean("is_featured").notNull().default(false), // Öne Çıkan İlanlar
  isActive: boolean("is_active").notNull().default(true),

  // Dış Anahtarlar
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
    // Değişiklik burada: Tablo nesnesinin bitimine index dizisini ekliyoruz
  index("properties_category_id_idx").on(table.categoryId),
  index("properties_user_id_idx").on(table.userId),
]);

// 4️⃣ Leads / Form Messages (Gelen Müşteri Talepleri & Mesajlar)
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // "new", "contacted", "closed"
  
  // Opsiyonel: İlan özelinden gelmişse ilgilendiği ilan ID'si
  propertyId: uuid("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// 5️⃣ FAQs (Sıkça Sorulan Sorular)
export const faqs = pgTable("faqs", {
  id: uuid("id").defaultRandom().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ----------------------------------------------------------------------
// 🔴 RELATIONS (İlişkiler)
// ----------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [properties.categoryId],
    references: [categories.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
}));

// ----------------------------------------------------------------------
// 🔴 TYPE INFERENCE (Tip Tanımlamaları)
// ----------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;