"use server";

import { v4 as randomUUID } from "crypto";
import { db } from "./db";
import fs from "fs/promises";
import path from "path";

const PUBLIC_DIR = path.resolve("public");
const PRODUCTS_STORAGE_DIR = path.join(PUBLIC_DIR, "storage", "products");
const DEFAULT_IMAGE = "/images/default.png";

async function ensureStorageDir() {
  await fs.mkdir(PRODUCTS_STORAGE_DIR, { recursive: true });
}

function getExt(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : "";
}

function dbImagePath(file: string): string {
  return `/storage/${file}`;
}

export async function storeProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = formData.get("price");
  const stock = formData.get("stock");
  const category = String(formData.get("category") ?? "").trim() || undefined;
  const image = formData.get("image") as File | null;

  // Validation: name required
  if (!name) {
    return { success: false, error: "Nama produk wajib diisi." };
  }

  // Validation: price numeric required
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return { success: false, error: "Harga wajib berupa angka." };
  }

  // Validation: stock numeric required
  const stockNum = Number(stock);
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    return { success: false, error: "Stok wajib berupa angka." };
  }

  let imagePath: string | null = null;

  if (image && image.size > 0) {
    const ext = getExt(image.name);
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(image.type)) {
      return { success: false, error: "Format gambar wajib JPG, PNG, atau WEBP." };
    }
    if (image.size > 2048 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 2MB." };
    }

    await ensureStorageDir();
    const fileName = `${randomUUID()}${ext}`;
    const filePath = path.join(PRODUCTS_STORAGE_DIR, fileName);

    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    imagePath = dbImagePath(fileName);
  }

  const data: any = {
    name,
    price: priceNum,
    stock: stockNum,
    category,
  };

  if (imagePath) {
    data.image = imagePath;
  }

  await db.products.create({ data });

  return {
    success: true,
    message: "Produk berhasil ditambahkan",
  };
}

export async function updateProduct(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = formData.get("price");
  const stock = formData.get("stock");
  const category = String(formData.get("category") ?? "").trim() || undefined;
  const image = formData.get("image") as File | null;

  // Validation
  if (!name) {
    return { success: false, error: "Nama produk wajib diisi." };
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return { success: false, error: "Harga wajib berupa angka." };
  }

  const stockNum = Number(stock);
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    return { success: false, error: "Stok wajib berupa angka." };
  }

  const product = await db.products.findUnique({ where: { id: Number(id) } });
  if (!product) {
    return { success: false, error: "Produk tidak ditemukan." };
  }

  let imagePath = product.image ?? null;

  if (image && image.size > 0) {
    // Delete old image if exists
    if (product.image) {
      try {
        const oldPath = path.join(PUBLIC_DIR, product.image.replace("/storage/", ""));
        await fs.unlink(oldPath).catch(() => {});
      } catch {}
    }

    const ext = getExt(image.name);
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(image.type)) {
      return { success: false, error: "Format gambar wajib JPG, PNG, atau WEBP." };
    }
    if (image.size > 2048 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 2MB." };
    }

    await ensureStorageDir();
    const fileName = `${randomUUID()}${ext}`;
    const filePath = path.join(PRODUCTS_STORAGE_DIR, fileName);

    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    imagePath = dbImagePath(fileName);
  }

  const data: any = {
    name,
    price: priceNum,
    stock: stockNum,
    category,
  };

  if (imagePath !== undefined && imagePath !== null) {
    data.image = imagePath;
  } else if (imagePath === null && product.image) {
    // User cleared the image - delete old one
    try {
      const oldPath = path.join(PUBLIC_DIR, product.image.replace("/storage/", ""));
      await fs.unlink(oldPath).catch(() => {});
    } catch {}
    data.image = null;
  }

  await db.products.update({
    where: { id: Number(id) },
    data,
  });

  return {
    success: true,
    message: "Produk berhasil diupdate",
  };
}

export async function destroyProduct(id: string) {
  const product = await db.products.findUnique({ where: { id: Number(id) } });
  if (!product) {
    return { success: false, error: "Produk tidak ditemukan." };
  }

  // Delete image file if exists
  if (product.image) {
    try {
      const oldPath = path.join(PUBLIC_DIR, product.image.replace("/storage/", ""));
      await fs.unlink(oldPath).catch(() => {});
    } catch {}
  }

  await db.products.delete({ where: { id: Number(id) } });

  return {
    success: true,
    message: "Produk berhasil dihapus",
  };
}