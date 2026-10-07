import { useState } from "react";
import { ImageIcon, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { QuantityStepper } from "./QuantityStepper";
import { useCart, unitPriceFor } from "@/lib/cart";
import { brl } from "@/lib/order";
import type { Product } from "@/lib/products";

export function ProductRow({ product }: { product: Product }) {
  const { add, mode, setDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const { price, wholesaleApplied } = unitPriceFor(product, qty, mode);

  const imageSource = product.image;
  const showImage = Boolean(imageSource) && !imageFailed;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {showImage ? (
        <img
          src={imageSource!}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground"
          aria-label={`Imagem de ${product.name} indisponível`}
        >
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{product.name}</p>
          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              <Star className="h-3 w-3" /> Destaque
            </span>
          )}
        </div>
        {product.description && <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>}
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{brl(price)}</span> / {product.unit}
          {wholesaleApplied && (
            <span className="ml-1 text-xs font-semibold text-primary">· preço de atacado aplicado</span>
          )}
        </p>
        {mode === "varejo" && (
          <p className="text-xs text-muted-foreground">
            Varejo: {brl(product.retail)} / {product.unit}
          </p>
        )}
        {mode === "atacado" && !wholesaleApplied && (
          <p className="text-xs text-muted-foreground">
            Atacado: {brl(product.wholesale)} / {product.unit} · mínimo de {product.wholesaleMin}{" "}
            {product.unit}{product.unit === "unidade" ? "s" : ""}
          </p>
        )}
        {mode === "atacado" && wholesaleApplied && (
          <p className="text-xs text-muted-foreground">
            Atacado aplicado a partir de {product.wholesaleMin} {product.unit}
            {product.unit === "unidade" ? "s" : ""}.
          </p>
        )}
        <p className="mt-auto pt-2 text-[11px] text-muted-foreground">
          O valor exibido é por {product.unit}. Para produtos vendidos por peso, o valor final pode
          variar conforme a quantidade pesada e será confirmado pelo WhatsApp.
        </p>
      </div>
      <div className="flex flex-col gap-2 border-t border-border p-4">
        <div className="flex items-center gap-2">
          <QuantityStepper value={qty} onChange={setQty} />
          <span className="text-xs text-muted-foreground">Quantidade</span>
        </div>
        <button
          type="button"
          onClick={() => {
            add(product.id, qty);
            setQty(1);
            setDrawerOpen(true);
            toast.success(`${product.name} adicionado ao carrinho`);
          }}
          className="btn-base btn-brand w-full justify-center px-4 py-2 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}
