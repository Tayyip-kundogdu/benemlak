import { db } from "./index";
import { categories } from "./schema";

const seedCategories = [
  { name: "Satılık Konut", slug: "satilik-konut", description: "Satılık daire, villa ve müstakil evler" },
  { name: "Kiralık Konut", slug: "kiralik-konut", description: "Kiralık daire ve evler" },
  { name: "Sezonluk Kiralık", slug: "sezonluk-kiralik", description: "Yazlık ve sezonluk kiralık emlaklar" },
  { name: "Konut Projeleri", slug: "konut-projeleri", description: "Yeni konut projeleri" },
  { name: "Arsa", slug: "arsa", description: "Satılık ve kiralık arsalar" },
  { name: "İşyeri", slug: "isyeri", description: "Dükkan, ofis ve ticari alanlar" },
];

const run = async () => {
  await db
    .insert(categories)
    .values(seedCategories)
    .onConflictDoNothing({ target: categories.slug });
  console.log("✅ Kategoriler eklendi");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed hatası:", err);
  process.exit(1);
});