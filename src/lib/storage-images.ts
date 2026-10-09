import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
const SIGN_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Converts any stored image value (bucket path, "product-images/..." path, or a
 * legacy Storage public/sign URL) into a bucket object path. Returns null for
 * external URLs, which are used as-is.
 */
export function toStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = value.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/product-images\/([^?#]+)/i);
  if (m) return decodeURIComponent(m[1]);
  if (/^https?:\/\//i.test(value)) return null;
  return value.replace(/^\/+/, "").replace(/^product-images\/+/i, "");
}

/** Resolves stored image values to displayable URLs (signed, since the bucket is private). */
export async function resolveImageUrls(
  client: SupabaseClient<any, any, any>,
  values: (string | null | undefined)[],
): Promise<(string | null)[]> {
  const paths = Array.from(new Set(values.map(toStoragePath).filter((p): p is string => !!p)));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await client.storage.from(BUCKET).createSignedUrls(paths, SIGN_SECONDS);
    for (const row of data ?? []) if (row.path && row.signedUrl) signed.set(row.path, row.signedUrl);
  }
  return values.map((v) => {
    if (!v) return null;
    const p = toStoragePath(v);
    if (p === null) return v; // external URL
    return signed.get(p) ?? null;
  });
}
