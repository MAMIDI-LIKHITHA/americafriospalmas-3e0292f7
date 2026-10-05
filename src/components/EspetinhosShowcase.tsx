import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { QuantityStepper } from "./QuantityStepper";
import { useCart, unitPriceFor } from "@/lib/cart";
import { brl } from "@/lib/order";
import type { Category, Product } from "@/lib/products";
import espetinhosImg from "@/assets/espetinhos.jpg";

function EspetinhoCard({ product }: { product: Product }) {
  const { add, mode, setDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [failed, setFailed] = useState(false);
  const { price } = unitPriceFor(product, qty, mode);
  const src = !failed && product.image ? product.image : espetinhosImg;

  return (
    <article className="card-surface flex w-64 shrink-0 snap-start flex-col overflow-hidden sm:w-auto">
      <img
        src={src}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="aspect-4/3 w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-bold leading-snug">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <p className="text-lg font-bold text-primary">
          {brl(price)} <span className="text-xs font-medium text-muted-foreground">/ {product.unit}</span>
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <QuantityStepper value={qty} onChange={setQty} />
          <button
            type="button"
            onClick={() => {
              add(product.id, qty);
              setQty(1);
              setDrawerOpen(true);
              toast.success(`${product.name} adicionado ao carrinho`);
            }}
            className="btn-base btn-brand flex-1 px-3 py-2 text-sm"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

export function EspetinhosShowcase({ category }: { category: Category }) {
  const products = category.products.slice(0, 8);
  return (
    <section className="border-b border-border bg-secondary/60 py-14">
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Destaque da casa</p>
            <h2 className="mt-2 font-display text-3xl tracking-wide md:text-4xl">ESPETINHOS</h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Escolha seus favoritos e monte seu pedido.
            </p>
            <Link
              to="/produtos"
              hash="espetinhos"
              className="btn-base btn-brand mt-6 px-6 py-3"
            >
              Ver todos os Espetinhos
            </Link>
          </div>
          <img
            src={espetinhosImg}
            alt="Espetinhos América Frios"
            loading="lazy"
            className="aspect-16/9 w-full rounded-xl object-cover"
          />
        </div>
        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {products.map((p) => (
            <EspetinhoCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
