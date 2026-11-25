"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { del, put } from "@vercel/blob";
import { db } from "./db";
import { requireRole } from "./auth";

function getExt(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : "";
}

async function storeImage(image: File): Promise<string> {
  const blob = await put(`${randomUUID()}${getExt(image.name)}`, image, {
    access: "public",
    contentType: image.type,
  });
  return blob.url;
}

async function removeImage(url: string | null | undefined) {
  if (!url || !url.startsWith("https://") || !url.includes("blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (error) {
    console.error("Gagal menghapus gambar lama", error);
  }
}

export async function storeProduct(formData: FormData) {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const price = formData.get("price");
  const stock = formData.get("stock");
  const category = String(formData.get("category") ?? "").trim() || undefined;
  const image = formData.get("image") as File | null;

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

  let imageUrl: string | null = null;

  if (image && image.size > 0) {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(image.type)) {
      return { success: false, error: "Format gambar wajib JPG, PNG, atau WEBP." };
    }
    if (image.size > 2048 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 2MB." };
    }
    imageUrl = await storeImage(image);
  }

  await db.products.create({
    data: {
      name,
      price: priceNum,
      stock: stockNum,
      category,
      ...(imageUrl ? { image: imageUrl } : {}),
    },
  });

  return {
    success: true,
    message: "Produk berhasil ditambahkan",
  };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const price = formData.get("price");
  const stock = formData.get("stock");
  const category = String(formData.get("category") ?? "").trim() || undefined;
  const image = formData.get("image") as File | null;

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

  let imageUrl = product.image;

  if (image && image.size > 0) {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedMimes.includes(image.type)) {
      return { success: false, error: "Format gambar wajib JPG, PNG, atau WEBP." };
    }
    if (image.size > 2048 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 2MB." };
    }
    imageUrl = await storeImage(image);
    await removeImage(product.image);
  }

  await db.products.update({
    where: { id: Number(id) },
    data: {
      name,
      price: priceNum,
      stock: stockNum,
      category,
      image: imageUrl,
    },
  });

  return {
    success: true,
    message: "Produk berhasil diupdate",
  };
}

export async function destroyProduct(id: string): Promise<void> {
  await requireRole("admin");
  const product = await db.products.findUnique({ where: { id: BigInt(id) } });
  if (!product) {
    redirect("/products?flash=error&msg=Produk+tidak+ditemukan.");
  }

  await db.products.delete({ where: { id: BigInt(id) } });
  await removeImage(product.image);

  redirect("/products?flash=success&msg=Produk+berhasil+dihapus.");
}
