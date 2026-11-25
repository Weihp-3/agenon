"use server";

import { db } from "./db";
import { getCart, saveCart, cartTotal, type CartItem } from "./cart";

/**
 * Cart endpoints used by the purchase flow. The response shape matches the
 * original JSON exactly, so the POS screen behaves the same.
 */

function json(ok: boolean, extra: Record<string, unknown>) {
  return { success: ok, ...extra };
}

export async function addToCart(
  productId: number,
  qty = 1,
): Promise<Record<string, unknown>> {
  const quantity = Math.trunc(qty);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
    return json(false, { error: "Jumlah tidak valid." });
  }

  const product = await db.products.findUnique({ where: { id: BigInt(productId) } });
  if (!product) {
    return json(false, { error: "Produk tidak ditemukan." });
  }

  const cart = await getCart();
  const existing = cart.find((item) => item.id === Number(product.id));

  if (existing) {
    existing.qty += quantity;
  } else {
    const item: CartItem = {
      id: Number(product.id),
      name: product.name,
      price: product.price,
      qty: quantity,
      image: product.image,
    };
    cart.push(item);
  }

  await saveCart(cart);

  return json(true, {
    cart_count: cart.length,
    cart,
    total: cartTotal(cart),
  });
}

export async function updateCart(
  itemId: number,
  qty: number,
): Promise<Record<string, unknown>> {
  const quantity = Math.trunc(qty);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
    return json(false, { error: "Jumlah tidak valid." });
  }

  const cart = await getCart();
  const item = cart.find((entry) => entry.id === itemId);
  if (item) item.qty = quantity;

  await saveCart(cart);

  return json(true, { cart, total: cartTotal(cart) });
}

export async function removeFromCart(
  itemId: number,
): Promise<Record<string, unknown>> {
  const cart = (await getCart()).filter((item) => item.id !== itemId);
  await saveCart(cart);

  return json(true, {
    cart_count: cart.length,
    cart,
    total: cartTotal(cart),
  });
}

export async function clearCart(): Promise<Record<string, unknown>> {
  await saveCart([]);
  return json(true, { cart: [], total: 0 });
}
