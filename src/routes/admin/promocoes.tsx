import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Gift, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { isCurrentUserAdmin } from "@/lib/admin";
import {
  deletePromotion,
  fetchAdminPromotions,
  resolvePromotionImageUrl,
  savePromotion,
  setPromotionSortOrder,
  type Promotion,
} from "@/lib/promotions-db";

export const Route = createFileRoute("/admin/promocoes")({
  ssr: false,
  beforeLoad: async () => {
    if (!(await isCurrentUserAdmin())) {
      throw redirect({ to: "/admin/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Promoções | Painel América Frios" },
      {
        name: "description",
        content: "Gestão dos cartões de promoção exibidos no site da América Frios.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Promoções | Painel América Frios" },
      {
        property: "og:description",
        content: "Área restrita para gerenciar os cartões de promoção do site.",
      },
    ],
  }),
  component: AdminPromotionsPage,
});

function AdminPromotionsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  const promotionsQuery = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: fetchAdminPromotions,
  });

  const promotions = useMemo(() => promotionsQuery.data ?? [], [promotionsQuery.data]);

  useEffect(() => {
    if (promotions.length === 0) return;
    let cancelled = false;
    void (async () => {
      const map: Record<string, string | null> = {};
      await Promise.all(
        promotions.map(async (p) => {
          map[p.id] = await resolvePromotionImageUrl(p.image_url);
        }),
      );
      if (!cancelled) setImageUrls(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [promotions]);

  function refresh() {
    void promotionsQuery.refetch();
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => {
      toast.success("Promoção excluída.");
      refresh();
    },
    onError: () => toast.error("Não foi possível excluir a promoção."),
  });

  const toggleMutation = useMutation({
    mutationFn: (input: { id: string; active: boolean }) =>
      savePromotion({
        id: input.id,
        title: promotions.find((p) => p.id === input.id)?.title ?? "",
        description: promotions.find((p) => p.id === input.id)?.description ?? null,
        badge: promotions.find((p) => p.id === input.id)?.badge ?? null,
        image_url: promotions.find((p) => p.id === input.id)?.image_url ?? null,
        cta_label: promotions.find((p) => p.id === input.id)?.cta_label ?? null,
        cta_url: promotions.find((p) => p.id === input.id)?.cta_url ?? null,
        active: input.active,
      }),
    onSuccess: refresh,
    onError: () => toast.error("Não foi possível alterar a promoção."),
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const u of updates) await setPromotionSortOrder(u.id, u.sort_order);
    },
    onSuccess: refresh,
    onError: () => toast.error("Não foi possível reordenar."),
  });

  function move(index: number, direction: -1 | 1) {
    const target = promotions[index + direction];
    const current = promotions[index];
    if (!target || !current) return;
    reorderMutation.mutate([
      { id: current.id, sort_order: index + direction },
      { id: target.id, sort_order: index },
    ]);
  }

  return (
    <AdminShell
      title="Promoções"
      subtitle="Cartões de promoção exibidos nas páginas do site. Não criam uma página separada."
      actions={
        <>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Atualizar
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Nova promoção
          </button>
        </>
      }
    >
      {promotionsQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando promoções…</p>
      ) : promotions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <Gift className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold text-foreground">Nenhuma promoção criada ainda.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie cartões de promoção para aparecerem no site, sem criar uma página nova.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {promotions.map((promotion, index) => (
            <li
              key={promotion.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              {imageUrls[promotion.id] ? (
                <img
                  src={imageUrls[promotion.id]!}
                  alt={promotion.title}
                  className="h-16 w-24 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                  {promotion.title}
                  {promotion.badge && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {promotion.badge}
                    </span>
                  )}
                </p>
                {promotion.description && (
                  <p className="text-sm text-muted-foreground">{promotion.description}</p>
                )}
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    promotion.active
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {promotion.active ? "Visível no site" : "Oculta"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover promoção para cima"
                  className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === promotions.length - 1}
                  aria-label="Mover promoção para baixo"
                  className="rounded-lg border border-border p-1.5 hover:bg-accent disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    toggleMutation.mutate({ id: promotion.id, active: !promotion.active })
                  }
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  {promotion.active ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  onClick={() => {
                    setEditing(promotion);
                    setFormOpen(true);
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir a promoção "${promotion.title}"?`)) {
                      deleteMutation.mutate(promotion.id);
                    }
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-accent"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <PromotionForm
          promotion={editing}
          onClose={() => setFormOpen(false)}
          onSaved={refresh}
        />
      )}
    </AdminShell>
  );
}
