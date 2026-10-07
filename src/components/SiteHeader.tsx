import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, UserRound, X } from "lucide-react";

import logo from "@/assets/logo.png";
import { CartButton } from "./CartDrawer";


const NAV = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/menu", label: "Consumo no Local" },
  { to: "/contato", label: "Contato" },
  { to: "/trabalhe-conosco", label: "Trabalhe Conosco" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(Boolean(s)));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="América Frios"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full md:h-11 md:w-11"
          />
          <span className="font-display text-lg leading-none font-bold tracking-tight md:text-xl">
            América <span className="text-primary">Frios</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-foreground/80 hover:text-primary" }}
              className="text-sm font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/conta"
            aria-label={signedIn ? "Minha conta" : "Entrar"}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <UserRound className="h-5 w-5" />
            <span className="hidden sm:inline">{signedIn ? "Minha conta" : "Entrar"}</span>
          </Link>
          <CartButton />

          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Navegação principal" className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="py-2.5 text-base font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
