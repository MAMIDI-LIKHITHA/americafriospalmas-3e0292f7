import { useState } from "react";
import { ImageIcon, ShoppingCart, Star } from "lucide-react";
import productCarne from "@/assets/product-images/01-espetinhos-de-carne.jpg";
import productFrango from "@/assets/product-images/02-espetinhos-de-frango.jpg";
import productLinguicaEspetinho from "@/assets/product-images/03-espetinhos-de-linguica.jpg";
import productCoracao from "@/assets/product-images/04-espetinhos-de-coracao.jpg";
import productQueijoEspetinho from "@/assets/product-images/05-espetinhos-de-queijo-coalho.jpg";
import productBacon from "@/assets/product-images/06-espetinhos-de-bacon.jpg";
import productToscana from "@/assets/product-images/07-linguica-toscana.jpg";
import productCalabresa from "@/assets/product-images/08-linguica-calabresa.jpg";
import productDefumada from "@/assets/product-images/09-linguica-defumada.jpg";
import productPresunto from "@/assets/product-images/10-presunto.jpg";
import productPresuntoFatiado from "@/assets/product-images/11-presunto-fatiado.jpg";
import productMussarela from "@/assets/product-images/12-queijo-mussarela.jpg";
import productPrato from "@/assets/product-images/13-queijo-prato.jpg";
import productQueijoCoalho from "@/assets/product-images/14-queijo-coalho.jpg";
import productSalameItaliano from "@/assets/product-images/15-salame-italiano.jpg";
import productSalameFatiado from "@/assets/product-images/16-salame-fatiado.jpg";
import productLinguicaChapa from "@/assets/product-images/17-linguica-na-chapa.jpg";
import productPaoAlho from "@/assets/product-images/18-pao-de-alho.jpg";
import productBatataFrita from "@/assets/product-images/19-porcao-de-batata-frita.jpg";
import productSanduiche from "@/assets/product-images/20-sanduiche-de-presunto-e-queijo.jpg";
import productRefriLata from "@/assets/product-images/21-refrigerante-em-lata.jpg";
import productRefri600 from "@/assets/product-images/22-refrigerante-600ml.jpg";
import productAguaMineral from "@/assets/product-images/23-agua-mineral.jpg";
import productAguaGas from "@/assets/product-images/24-agua-com-gas.jpg";
import productSucoNatural from "@/assets/product-images/25-suco-natural.jpg";
import { toast } from "sonner";

import { QuantityStepper } from "./QuantityStepper";
import { useCart, unitPriceFor } from "@/lib/cart";
import { brl } from "@/lib/order";
import type { Product } from "@/lib/products";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function localProductImage(product: Pick<Product, "id" | "name" | "category">) {
  // Use the database slug + product name + category together. This is important
  // because some database names differ slightly from the source image filenames.
  const key = normalize(`${product.id} ${product.name} ${product.category}`);
  const has = (...terms: string[]) => terms.some((term) => key.includes(normalize(term)));

  // Every source photo has one dedicated rule. Specific matches come first so
  // products such as "Sanduíche de Presunto e Queijo" never receive the generic
  // presunto photo.
  if (has("sanduiche de presunto e queijo", "sanduiche-presunto-queijo")) return productSanduiche;
  if (has("linguica na chapa", "linguica-na-chapa")) return productLinguicaChapa;
  if (has("pao de alho", "pao-de-alho")) return productPaoAlho;
  if (has("porcao de batata frita", "batata-frita")) return productBatataFrita;
  if (has("refrigerante em lata", "refrigerante-em-lata")) return productRefriLata;
  if (has("refrigerante 600ml", "refrigerante-600ml")) return productRefri600;
  if (has("agua mineral", "agua-mineral")) return productAguaMineral;
  if (has("agua com gas", "agua-com-gas")) return productAguaGas;
  if (has("suco natural", "suco-natural")) return productSucoNatural;

  if (has("espetinho de alcatra", "espetinho-alcatra", "alcatra")) return productCarne;\n  if (has("espetinho de contra file", "espetinho-contra-file", "contra file", "contrafile")) return productCarne;\n  if (has("espetinho de costelinha suina", "espetinho-costelinha-suina", "costelinha suina")) return productCarne;\n  if (has("espetinho de cupim", "espetinho-cupim", "cupim")) return productCarne;
  if (has("espetinho de carne", "espetinho-carne")) return productCarne;
  if (has("espetinho de frango", "espetinho-frango")) return productFrango;
  if (has("espetinho de linguica", "espetinho-linguica")) return productLinguicaEspetinho;
  if (has("espetinho de coracao", "espetinho-coracao")) return productCoracao;
  if (has("espetinho de queijo coalho", "espetinho-queijo-coalho")) return productQueijoEspetinho;
  if (has("espetinho de bacon", "espetinho-bacon")) return productBacon;

  if (has("linguica toscana", "linguica-toscana")) return productToscana;
  if (has("linguica calabresa", "linguica-calabresa")) return productCalabresa;
  if (has("linguica defumada", "linguica-defumada")) return productDefumada;

  if (has("presunto fatiado", "presunto-fatiado")) return productPresuntoFatiado;
  if (has("presunto")) return productPresunto;

  if (has("queijo mussarela", "mussarela", "queijo-mussarela")) return productMussarela;
  if (has("queijo prato", "queijo-prato")) return productPrato;
  if (has("queijo coalho", "queijo-coalho")) return productQueijoCoalho;

  if (has("salame italiano", "salame-italiano")) return productSalameItaliano;
  if (has("salame fatiado", "salame-fatiado")) return productSalameFatiado;

  return null;
}

export function ProductRow({ product }: { product: Product }) {
  const { add, mode, setDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const { price, wholesaleApplied } = unitPriceFor(product, qty, mode);

  // Resolve bundled Vite assets on the client. This avoids runtime/public/remote URL failures.
  const imageSource = localProductImage(product) ?? product.image;
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
