/**
 * Laravel flashed its messages through the session for exactly one request.
 * Here a mutation redirects back with ?flash=&msg=; the Flash component shows
 * it and then removes the query so a refresh does not bring it back.
 */

export type FlashType = "success" | "error" | "warning" | "info";

export function flashPath(
  path: string,
  type: FlashType,
  message: string,
): string {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("flash", type);
  url.searchParams.set("msg", message);
  return `${url.pathname}${url.search}`;
}

export function readFlash(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): { type: FlashType; message: string } | null {
  const get = (key: string): string => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };

  const type = get("flash") as FlashType;
  const message = get("msg");

  if (!message) return null;
  if (type !== "success" && type !== "error" && type !== "warning" && type !== "info") {
    return null;
  }

  return { type, message };
}
