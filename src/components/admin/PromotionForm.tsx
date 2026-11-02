import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";

import {
  savePromotion,
  uploadPromotionImage,
  resolvePromotionImageUrl,
  type Promotion,
} from "@/lib/promotions-db";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/products-db";

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

export function PromotionForm({
  promotion,
  onClose,
  onSaved,
}: {
  promotion: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(promotion?.title ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [badge, setBadge] = useState(promotion?.badge ?? "");
  const [ctaUrl, setCtaUrl] = useState(promotion?.cta_url ?? "");
  const [ctaLabel, setCtaLabel] = useState(promotion?.cta_label ?? "");
  const [imagePath, setImagePath] = useState<string | null>(promotion?.image_url ?? null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    void resolvePromotionImageUrl(imagePath).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [file, imagePath]);

  function handleFile(selected: File | undefined) {
    if (!selected) return;
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      toast.error("Imagem muito grande. Máximo de 5 MB.");
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Informe o título da promoção.");
      return;
    }
    const trimmedUrl = ctaUrl.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      toast.error("O link deve começar com http:// ou https://");
      return;
    }

    setSaving(true);
    try {
      let finalImage = imagePath;
      if (file) finalImage = await uploadPromotionImage(file);

      await savePromotion({
        id: promotion?.id,
        title: trimmedTitle,
        description: description.trim() || null,
        badge: badge.trim() || null,
        image_url: finalImage,
        cta_label: ctaLabel.trim() || null,
        cta_url: trimmedUrl || null,
        active: promotion?.active ?? true,
      });

      toast.success(promotion ? "Promoção atualizada." : "Promoção criada.");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a promoção.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-foreground">
            {promotion ? "Editar promoção" : "Nova promoção"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg border border-border p-2 text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Título *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              placeholder="Ex.: Combo de Espetinhos"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Descrição
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Ex.: Leve 5 espetinhos e pague 4, válido até domingo."
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Etiqueta (opcional)
            </span>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              maxLength={24}
              placeholder="Ex.: Promoção da semana"
              className={inputClass}
            />
          </label>

          <label>
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Texto do botão (opcional)
            </span>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              maxLength={32}
              placeholder="Ex.: Pedir no WhatsApp"
              className={inputClass}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Link do botão (opcional)
            </span>
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              maxLength={400}
              placeholder="Ex.: https://wa.me/5563984021014"
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Imagem</span>
            <div className="mt-2 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="Pré-visualização" className="h-20 w-28 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="text-sm text-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WEBP — até 5 MB.</p>
                {(file || imagePath) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setImagePath(null);
                    }}
                    className="mt-2 text-xs font-semibold text-destructive"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar promoção"}
          </button>
        </div>
      </form>
    </div>
  );
}
