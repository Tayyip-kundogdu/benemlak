import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ENV } from "../config/env";

if (!ENV.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// PostgreSQL bağlantı havuzunu (connection pool) başlat
const pool = new Pool({ connectionString: ENV.DATABASE_URL });

// İlk veritabanı bağlantısı kurulduğunda log bas
pool.on("connect", () => {
  console.log("Real Estate Database connected successfully ✅");
});

// Veritabanı bağlantı hatası oluşursa log bas
pool.on("error", (err) => {
  console.error("💥 Real Estate Database connection error:", err);
});

// Drizzle ORM örneğini oluştur ve emlak şemasını bağla
export const db = drizzle({ client: pool, schema });