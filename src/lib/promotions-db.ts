import { supabase } from "@/integrations/supabase/client";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, resolveProductImageUrl } from "./products-db";

export type Promotion = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  active: boolean;
  sort_order: number;
};

export type PromotionInput = {
  id?: string | undefined;
  title: string;
  description: string | null;
  badge: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  active: boolean;
};

export async function fetchActivePromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, badge, image_url, cta_label, cta_url, active, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Promotion[];
}

export async function fetchAdminPromotions() {
  const { data, error } = await supabase
    .from("promotions")
    .select("id, title, description, badge, image_url, cta_label, cta_url, active, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Promotion[];
}

export async function savePromotion(input: PromotionInput) {
  const payload = {
    title: input.title,
    description: input.description,
    badge: input.badge,
    image_url: input.image_url,
    cta_label: input.cta_label,
    cta_url: input.cta_url,
    active: input.active,
  };
  if (input.id) {
    const { error } = await supabase.from("promotions").update(payload).eq("id", input.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("promotions")
    .insert({ ...payload, sort_order: Date.now() % 100000 });
  if (error) throw error;
}

export async function deletePromotion(id: string) {
  const { error } = await supabase.from("promotions").delete().eq("id", id);
  if (error) throw error;
}

export async function setPromotionActive(id: string, active: boolean) {
  const { error } = await supabase.from("promotions").update({ active }).eq("id", id);
  if (error) throw error;
}

export async function setPromotionSortOrder(id: string, sortOrder: number) {
  const { error } = await supabase.from("promotions").update({ sort_order: sortOrder }).eq("id", id);
  if (error) throw error;
}

export async function uploadPromotionImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Formato inválido. Use JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Imagem muito grande. Tamanho máximo: 5 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `promotions/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Não foi possível enviar a imagem.");
  return path;
}

export function resolvePromotionImageUrl(imageUrl: string | null) {
  return resolveProductImageUrl(imageUrl);
}
