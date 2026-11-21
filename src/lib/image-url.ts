/**
 * Normaliza URLs de imágenes de productos para que funcionen directamente en <img>.
 * Convierte enlaces compartidos de Google Drive (/file/d/ID/view, ?id=ID, uc?id=ID)
 * al endpoint directo de miniatura en alta resolución.
 */
export function normalizeProductImageUrl(rawUrl?: string | null): string | undefined {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return undefined;
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "drive.google.com" || host === "docs.google.com") {
    const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idParam = parsed.searchParams.get("id");
    const fileId = fileMatch?.[1] || idParam;
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  return parsed.toString();
}
