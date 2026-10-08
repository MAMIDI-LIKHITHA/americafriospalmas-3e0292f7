import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";

import type { Category } from "@/lib/products";
import { ProductRow } from "./ProductRow";
import { brl } from "@/lib/order";
import friosFallback from "@/assets/frios.jpg";
import embutidosFallback from "@/assets/embutidos.jpg";
import carnesFallback from "@/assets/suinos.jpg";
import frangoFallback from "@/assets/frangos.jpg";
import espetinhosFallback from "@/assets/espetinhos.jpg";
import atacadoFallback from "@/assets/atacado.jpg";

function getCategoryFallback(category: Category) {
  const name = category.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (name.includes("espetinho")) return espetinhosFallback;
  if (name.includes("embutido") || name.includes("linguica")) return embutidosFallback;
  if (name.includes("carne")) return carnesFallback;
  if (name.includes("frango")) return frangoFallback;
  if (name.includes("congelado")) return atacadoFallback;
  return friosFallback;
}

export function CategoryCard({
  category,
  showProducts = false,
}: {
  category: Category;
  showProducts?: boolean;
}) {
  const from = Math.min(...category.products.map((p) => p.retail));
  const fallbackImage = getCategoryFallback(category);

  return (
    <article className={showProducts ? "space-y-4" : "card-surface flex flex-col overflow-hidden"} id={category.slug}>
      {!showProducts && (
        <div className="relative aspect-[16/7] overflow-hidden bg-muted">
          {category.image ? (
            <img
              src={category.image}
              alt={`${category.name} — América Frios`}
              width={1024}
              height={768}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(event) => {
                const image = event.currentTarget;
                if (image.dataset["fallbackApplied"] === "true") {
                  image.style.display = "none";
                  image.nextElementSibling?.classList.remove("hidden");
                  return;
                }
                image.dataset.fallbackApplied = "true";
                image.src = fallbackImage;
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground ${category.image ? "hidden" : ""}`}
            aria-label={`Imagem de ${category.name} indisponível`}
          >
            <ImageIcon className="h-8 w-8" />
            <span className="text-sm font-semibold">{category.name}</span>
          </div>
          <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            A partir de {brl(from)}
          </span>
        </div>
      )}
      <div className={showProducts ? "space-y-4" : "flex flex-1 flex-col gap-3 p-5"}>
        {category.name === "Espetinhos" && <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"><span aria-hidden="true">★</span> Mais pedidos</div>}
        <h3 className={showProducts ? "font-display text-2xl font-bold md:text-3xl" : "font-display text-lg font-bold"}>{category.name}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>

        {showProducts ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {category.items.map((i) => (
                <li
                  key={i}
                  className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {i}
                </li>
              ))}
            </ul>
            <Link
              to="/produtos"
              hash={category.slug}
              className="btn-base btn-brand mt-auto w-full px-4 py-2 text-sm"
            >
              Ver e pedir
            </Link>
          </>
        )}
      </div>
    </article>
  );
}