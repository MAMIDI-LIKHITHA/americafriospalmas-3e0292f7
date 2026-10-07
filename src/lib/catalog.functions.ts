import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import productCarne from "@/assets/product-images/01-espetinhos-de-carne.jpg";
import productFrango from "@/assets/product-images/02-espetinhos-de-frango.jpg";
import productLinguicaEspetinho from "@/assets/product-images/03-espetinhos-de-linguica.jpg";
import productCoracao from "@/assets/product-images/04-espetinhos-de-coracao.jpg";
import productQueijoEspetinho from "@/assets/product-images/05-espetinhos-de-queijo-coalho.jpg";
import productBacon from "@/assets/product-images/06-espetinhos-de-bacon.jpg";
import productToscana from "@/assets/product-images/07-linguica-toscana.jpg";
import productCalabresa from "@/assets/product-images/08-linguica-calabresa.jpg";
import productDefumada from "@/assets/product-images/09-linguica-defumada.jpg";
import productPresunto from "@/assets/product-images/10-presunto.jpg";
import productPresuntoFatiado from "@/assets/product-images/11-presunto-fatiado.jpg";
import productMussarela from "@/assets/product-images/12-queijo-mussarela.jpg";
import productPrato from "@/assets/product-images/13-queijo-prato.jpg";
import productQueijoCoalho from "@/assets/product-images/14-queijo-coalho.jpg";
import productSalameItaliano from "@/assets/product-images/15-salame-italiano.jpg";
import productSalameFatiado from "@/assets/product-images/16-salame-fatiado.jpg";

import type { Database } from "@/integrations/supabase/types";
import {
  CATEGORY_META,
  FALLBACK_CATEGORY_IMAGE,
  categorySlug,
  type Category,
  type Product,
} from "./products";

/** Cliente público (chave publicável) — só enxerga o que a RLS libera para visitantes:
 *  products com available = true. Nenhuma escrita é possível por aqui. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY on the server.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    const supabase = publicClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, description, category, unit, price, wholesale_price, wholesale_min, image_url, featured, sort_order")
      .eq("available", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error("Não foi possível carregar o catálogo.");

    const rows = (data ?? []).filter((r) => r.slug && Number(r.price ?? 0) > 0);

    // Prefer the dedicated product photos committed in public/produtos.
    // Matching is based on the database product name/category, so each catalog
    // item gets its corresponding photo without changing commercial data.
    const normalize = (value: string | null | undefined) =>
      (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const productImagePath = (name: string, category: string) => {
      const n = normalize(name);
      const c = normalize(category);
      const is = (...terms: string[]) => terms.some((term) => n.includes(normalize(term)));

      if (c.includes("espetinho") || n.includes("espetinho")) {
        if (is("carne")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/01-espetinhos-de-carne.jpg";
        if (is("frango")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/02-espetinhos-de-frango.jpg";
        if (is("linguica", "linguiça")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/03-espetinhos-de-linguica.jpg";
        if (is("coracao", "coração")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/04-espetinhos-de-coracao.jpg";
        if (is("queijo coalho")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/05-espetinhos-de-queijo-coalho.jpg";
        if (is("bacon")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/06-espetinhos-de-bacon.jpg";
      }

      if (c.includes("linguica") || c.includes("linguiça")) {
        if (is("toscana")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/07-linguica-toscana.jpg";
        if (is("calabresa")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/08-linguica-calabresa.jpg";
        if (is("defumada")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/09-linguica-defumada.jpg";
      }

      if (c.includes("presunto") || n.includes("presunto")) {
        if (is("fatiado", "fatiada", "fatiad")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/11-presunto-fatiado.jpg";
        return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/10-presunto.jpg";
      }

      if (c.includes("queijo") || n.includes("queijo")) {
        if (is("mussarela", "muçarela", "mucarela")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/12-queijo-mussarela.jpg";
        if (is("prato")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/13-queijo-prato.jpg";
        if (is("queijo coalho")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/14-queijo-coalho.jpg";
      }

      if (c.includes("salame") || n.includes("salame")) {
        if (is("fatiado", "fatiada", "fatiad")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/16-salame-fatiado.jpg";
        if (is("italiano")) return "https://raw.githubusercontent.com/MAMIDI-LIKHITHA/americafriospalmas-3e0292f7/main/public/product-images/15-salame-italiano.jpg";
      }

      return null;
    };

    // Product images are public storefront assets. image_url stores the path
    // inside the product-images bucket, so use stable public URLs instead of
    // expiring signed URLs that depend on authenticated storage access.
    const imageUrl = (value: string | null) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return supabase.storage.from("product-images").getPublicUrl(value).data.publicUrl;
    };

    const byCategory = new Map<string, Product[]>();
    for (const r of rows) {
      const retail = Number(r.price ?? 0);
      const wholesale = Number(r.wholesale_price ?? retail) || retail;
      const product: Product = {
        id: r.slug!,
        name: r.name,
        unit: r.unit,
        retail,
        wholesale,
        wholesaleMin: Number(r.wholesale_min ?? 1) || 1,
        category: r.category,
        image: productImagePath(r.name, r.category) ?? imageUrl(r.image_url),
        description: r.description,
        featured: r.featured,
      };
      const list = byCategory.get(r.category);
      if (list) list.push(product);
      else byCategory.set(r.category, [product]);
    }


    const categories: Category[] = [];
    const used = new Set<string>();

    for (const meta of CATEGORY_META) {
      const products = byCategory.get(meta.name);
      if (!products || products.length === 0) continue;
      used.add(meta.name);
      categories.push({ ...meta, items: products.map((p) => p.name), products });
    }

    for (const [name, products] of byCategory) {
      if (used.has(name)) continue;
      categories.push({
        slug: categorySlug(name),
        name,
        image: FALLBACK_CATEGORY_IMAGE,
        description: `Confira nossa seleção de ${name.toLowerCase()}.`,
        items: products.map((p) => p.name),
        products,
      });
    }

    return categories;
  },
);
