import { cookies } from "next/headers";

/**
 * The cashier cart lived in the Laravel session. It is an httpOnly cookie now,
 * but the item shape is byte-for-byte the same as the Blade cart, because the
 * checkout screen and its JSON responses are ported unchanged.
 */
export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

const COOKIE_NAME = "wmz_cart";
const MAX_AGE = 60 * 60 * 24 * 7;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.qty === "number"
  );
}

export async function getCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

export async function saveCart(items: CartItem[]): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
