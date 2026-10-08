import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star, Store, MessageCircle, PackageCheck, Sparkles, Utensils, Instagram, Gift, Coffee } from "lucide-react";

import { CategoryCard } from "@/components/CategoryCard";
import { EspetinhosShowcase } from "@/components/EspetinhosShowcase";
import { StoreCard } from "@/components/StoreCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { catalogQueryOptions } from "@/lib/catalog";
import { STORES, localBusinessSchema } from "@/lib/site";
import heroImg from "@/assets/Homepage.png";
import localImg from "@/assets/loja-interior.jpg";
import varietyImg from "@/assets/deli-variety.png";
import homeFallbackImg from "@/assets/espetinhos.jpg";
import sectionFallbackImg from "@/assets/frios.jpg";
import varietyFallbackImg from "@/assets/atacado.jpg";
import homepageEspetinhosImg from "@/assets/espetinhos-brasil.jpg";
import homepageFriosImg from "@/assets/frios.jpg";
import homepageQueijosImg from "@/assets/Queijos — Cheese.png";
import homepagePresuntosImg from "@/assets/Presuntos — Ham.png";
import homepageSalamesImg from "@/assets/Salames — Salami.png";
import homepageEmbutidosImg from "@/assets/embutidos.jpg";
import homepageLinguicasImg from "@/assets/Linguiças — Sausages.png";

const HOMEPAGE_CATEGORY_IMAGES: Record<string, string> = {
  espetinhos: homepageEspetinhosImg,
  frios: homepageFriosImg,
  queijos: homepageQueijosImg,
  presuntos: homepagePresuntosImg,
  salames: homepageSalamesImg,
  embutidos: homepageEmbutidosImg,
  linguicas: homepageLinguicasImg,
};

const description =
  "América Frios em Palmas: frios, queijos, carnes, embutidos e outros produtos para sua casa ou negócio.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início | América Frios Palmas" },
      { name: "description", content: description },
      { property: "og:title", content: "Início | América Frios Palmas" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://americafriospalmas.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://americafriospalmas.lovable.app/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions),
  component: Index,
  errorComponent: HomeError,
  notFoundComponent: HomeError,
});

function HomeError() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl">Não foi possível carregar a página</h1>
      <p className="mt-3 text-muted-foreground">
        Atualize a página em alguns instantes ou fale conosco no WhatsApp.
      </p>
      <WhatsAppButton className="mt-6" />
    </div>
  );
}

const EXPERIENCES = [
  { icon: PackageCheck, title: "Para sua casa ou negócio", text: "Opções para compras do dia a dia e abastecimento." },
  { icon: Sparkles, title: "Frios e especialidades", text: "Queijos, presuntos, salames, carnes, embutidos e mais." },
  { icon: Utensils, title: "Consumo no local", text: "Confira as opções disponíveis para aproveitar na loja." },
  { icon: MessageCircle, title: "Atendimento pelo WhatsApp", text: "Consulte disponibilidade, pedidos e informações." },
];

function Index() {
  const { data: categories } = useSuspenseQuery(catalogQueryOptions);
  const espetinhos = categories.find((c) => c.slug === "espetinhos" && c.products.length > 0);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema()).replace(/</g, "\\u003c"),
        }}
      />
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImg}
          alt="América Frios — produtos e atendimento em Palmas"
          width={1536}
          height={864}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = homeFallbackImg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/35 to-transparent" />
        <div className="container-page relative py-16 md:py-24">
          <p className="font-display text-sm font-semibold tracking-widest text-cream/70 uppercase">
            Palmas - TO · Loja física e pedidos
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
            Frios, carnes e especialidades para sua mesa
          </h1>
          <p className="mt-5 max-w-2xl text-base text-cream/80 md:text-lg">
            Explore o catálogo, monte seu pedido e fale com nossa equipe pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/produtos" className="btn-base btn-brand px-6 py-3.5 text-base">
              Ver Produtos
            </Link>
            <WhatsAppButton size="lg" label="Falar no WhatsApp" />
          </div>
        </div>
      </section>

      <section className="container-page py-8 md:py-10">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary px-6 py-7 text-primary-foreground shadow-sm md:px-10 md:py-9">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary-foreground/10" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-primary-foreground/5" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <Gift className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary-foreground/75">
                  Oferta especial
                </p>
                <h2 className="mt-1 font-display text-2xl md:text-3xl">Kit Festa · R$ 60,00</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/85 md:text-base">
                  Escolha até 3 sabores e ganhe 1,5L de Guaraná Antarctica. Perfeito para sua festa!
                </p>
                <p className="mt-2 text-xs text-primary-foreground/70">
                  Empada não inclusa no kit.
                </p>
              </div>
            </div>
            <Link
              to="/produtos"
              className="btn-base shrink-0 bg-background px-5 py-3 text-center font-bold text-foreground hover:bg-background/90"
            >
              Ver Kit Festa
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page pb-8 md:pb-10">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-7 shadow-sm md:px-10 md:py-9">
          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/5" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Coffee className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">
                  Disponível na América Frios
                </p>
                <h2 className="mt-1 font-display text-2xl md:text-3xl">Mochi Café</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Café Mochi disponível para compra na América Frios.
                </p>
                <p className="mt-2 text-xs font-semibold text-primary">
                  Ponto de Venda: América Frios
                </p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/americafriospalmas/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-base btn-outline-brand shrink-0"
            >
              Saiba Mais
            </a>
          </div>
        </div>
      </section>

      {espetinhos && <EspetinhosShowcase category={espetinhos} />}

      <section className="border-b border-border bg-card py-10">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Categorias</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Escolha por categoria</h2>
          </div>
          <Link to="/produtos" className="text-sm font-semibold text-primary hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Veja os principais grupos de produtos e acesse o catálogo para montar seu pedido.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard
              key={c.name}
              category={c}
              homepageImage={HOMEPAGE_CATEGORY_IMAGES[c.slug]}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src={localImg}
            alt="Espaço da América Frios para consumo no local"
            loading="lazy"
            className="aspect-4/3 w-full rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = sectionFallbackImg;
            }}
          />
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Experiência na loja</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Consumo no local</h2>
            <p className="mt-4 text-muted-foreground">
              Veja as opções disponíveis para consumo no local e consulte nossa equipe sobre horários e disponibilidade.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppButton label="Fale Conosco" message="Olá! Gostaria de saber mais sobre o consumo no local da América Frios." />
              <Link to="/menu" className="btn-base btn-outline-brand">Ver opções para consumo</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-widest text-primary uppercase">Novidades</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl">Acompanhe a América Frios</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Veja produtos, novidades e conteúdos no perfil oficial do Instagram.
            </p>
            <a href="https://www.instagram.com/americafriospalmas/" target="_blank" rel="noopener noreferrer" className="btn-base btn-brand mt-6"><Instagram className="h-4 w-4" /> Ver Instagram</a>
          </div>
          <img
            src={varietyImg}
            alt="Variedade de produtos alimentícios da América Frios"
            loading="lazy"
            className="aspect-16/9 w-full rounded-lg object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = varietyFallbackImg;
            }}
          />
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60 py-16">
        <div className="container-page">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">Nossas lojas</p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl">Encontre uma loja</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {STORES.map((s) => (
              <StoreCard key={s.slug} store={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-2xl md:text-3xl">
            Precisa de ajuda com seu pedido?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
            Fale com nossa equipe para confirmar disponibilidade, entrega ou retirada.
          </p>
          <WhatsAppButton size="lg" className="mt-7 justify-center" />
        </div>
      </section>
    </div>
  );
}
