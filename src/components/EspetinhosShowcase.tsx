import { Link } from "@tanstack/react-router";

import type { Category } from "@/lib/products";
import espetinhosImg from "@/assets/espetinhos-brasil.jpg";

export function EspetinhosShowcase({ category }: { category: Category }) {
  const image = category.image ?? espetinhosImg;
  return (
    <section className="border-b border-border bg-secondary/60 py-16 md:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <img
          src={image}
          alt="Espetinhos América Frios"
          loading="lazy"
          width={1536}
          height={1024}
          className="aspect-16/10 w-full rounded-2xl object-cover shadow-lg"
        />
        <div>
          <p className="text-sm font-bold tracking-widest text-primary uppercase">Destaque</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">Espetinhos</h2>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Uma variedade de sabores para deixar seu churrasco ainda melhor.
          </p>
          <Link to="/produtos" hash="espetinhos" className="btn-base btn-brand mt-8 px-7 py-3.5 text-base">
            Ver Espetinhos
          </Link>
        </div>
      </div>
    </section>
  );
}
