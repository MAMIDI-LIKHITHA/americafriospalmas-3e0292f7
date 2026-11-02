import { useEffect, useState } from "react";
import { ArrowRight, Gift } from "lucide-react";

import { fetchActivePromotions, resolvePromotionImageUrl, type Promotion } from "@/lib/promotions-db";

/**
 * Renders admin-managed promotion cards inline on existing site pages.
 * No dedicated page is created; hidden entirely when there is nothing active.
 */
export function PromotionCards() {
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchActivePromotions();
        if (cancelled) return;
        setPromotions(rows);
        const map: Record<string, string | null> = {};
        await Promise.all(
          rows.map(async (p) => {
            map[p.id] = await resolvePromotionImageUrl(p.image_url);
          }),
        );
        if (!cancelled) setImageUrls(map);
      } catch {
        if (!cancelled) setPromotions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="container-page pt-6 md:pt-8" aria-label="Promoções">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion) => {
          const image = imageUrls[promotion.id];
          const label = promotion.cta_label?.trim() || "Saiba mais";
          return (
            <article
              key={promotion.id}
              className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt={promotion.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                </>
              ) : (
                <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary/10" />
              )}
              <div className="relative p-5">
                {promotion.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    <Gift className="h-3 w-3" /> {promotion.badge}
                  </span>
                )}
                <h3 className={`font-display text-xl font-bold ${image ? "text-cream" : "text-foreground"}`}>
                  {promotion.title}
                </h3>
                {promotion.description && (
                  <p className={`mt-1.5 text-sm ${image ? "text-cream/85" : "text-muted-foreground"}`}>
                    {promotion.description}
                  </p>
                )}
                {promotion.cta_url && (
                  <a
                    href={promotion.cta_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
