/*
import { Request, Response } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../db/queries";
 
// ==========================================
// KATEGORİ CONTROLLER
// queries.ts içindeki fonksiyonları HTTP katmanına bağlar
// ==========================================
 
// GET /categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error("getCategories error:", error);
    return res
      .status(500)
      .json({ message: "Kategoriler getirilirken bir hata oluştu." });
  }
};
 
// GET /categories/:id
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id as string);
 
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
 
    return res.status(200).json(category);
  } catch (error) {
    console.error("getCategory error:", error);
    return res
      .status(500)
      .json({ message: "Kategori getirilirken bir hata oluştu." });
  }
};
 
// POST /categories
export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const newCategory = await createCategory(req.body);
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("createCategoryHandler error:", error);
    return res
      .status(500)
      .json({ message: "Kategori oluşturulurken bir hata oluştu." });
  }
};
 
// PUT /categories/:id
export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCategory = await updateCategory(id as string, req.body);
    return res.status(200).json(updatedCategory);
  } catch (error: any) {
    console.error("updateCategoryHandler error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    return res
      .status(500)
      .json({ message: "Kategori güncellenirken bir hata oluştu." });
  }
};
 
// DELETE /categories/:id
export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedCategory = await deleteCategory(id as string);
    return res
      .status(200)
      .json({ message: "Kategori silindi.", category: deletedCategory });
  } catch (error: any) {
    console.error("deleteCategoryHandler error:", error);
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    return res
      .status(500)
      .json({ message: "Kategori silinirken bir hata oluştu." });
  }
};*/



import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Tüm kategorileri getir (Public)
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await queries.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
};

// ID'ye göre tek kategori getir (Public)
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await queries.getCategoryById(id as string);

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({ error: "Failed to get category" });
  }
};

// Yeni kategori oluştur (Protected - Sadece yetkili Danışman)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, slug, description } = req.body;

    if (!name) {
      res.status(400).json({ error: "Category name is required" });
      return;
    }

    const category = await queries.createCategory({
      name,
      slug,
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Kategori güncelle (Protected - Sadece yetkili Danışman)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { name, slug, description } = req.body;

    // Kategorinin varlığını kontrol et
    const existingCategory = await queries.getCategoryById(id as string);
    if (!existingCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const updatedCategory = await queries.updateCategory(id as string, {
      name,
      slug,
      description,
    });

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Kategori sil (Protected - Sadece yetkili Danışman)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // Kategorinin varlığını kontrol et
    const existingCategory = await queries.getCategoryById(id as string);
    if (!existingCategory) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    await queries.deleteCategory(id as string);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};