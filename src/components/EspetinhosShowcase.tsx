import { Link } from "@tanstack/react-router";

import type { Category } from "@/lib/products";
import productCarne from "@/assets/product-images/01-espetinhos-de-carne.jpg";
import productFrango from "@/assets/product-images/02-espetinhos-de-frango.jpg";
import productLinguica from "@/assets/product-images/03-espetinhos-de-linguica.jpg";
import productCoracao from "@/assets/product-images/04-espetinhos-de-coracao.jpg";
import productQueijo from "@/assets/product-images/05-espetinhos-de-queijo-coalho.jpg";

const homepageImages = [productCarne, productFrango, productLinguica, productCoracao, productQueijo];

export function EspetinhosShowcase({ category }: { category: Category }) {
  // Homepage intentionally uses five fixed, bundled assets in product order.
  // This avoids Supabase/public URL or editable-name issues after publishing.
  const products = category.products.slice(0, 5);

  return (
    <section className="border-b border-border bg-secondary/60 py-16 md:py-20">
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Destaque</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl">Espetinhos</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Uma variedade de sabores para deixar seu churrasco ainda melhor.
            </p>
          </div>
          <Link to="/produtos" hash="espetinhos" className="btn-base btn-brand px-6 py-3">
            Ver Espetinhos
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product, index) => {
            const image = homepageImages[index];
            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <img
                  src={image}
                  alt={product.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{product.unit}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
