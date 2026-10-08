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

// Mochi Café product images.
import mochaCafeEspecial from "@/assets/product-images/Premium Brazilian Coffee Bag Still Life.png";
import mochaCafeMoido from "@/assets/product-images/Premium Brazilian Coffee Bag.png";
import mochaCafeGraos from "@/assets/product-images/Premium Brazilian Coffee Package.png";

// Uploaded Congelados catalog images.
import frozenBolinhaQueijo from "@/assets/product-images/América FRIOS Bolinha de Queijo Showcase.png";
import frozenCoxinhaFrango from "@/assets/product-images/América FRIOS Coxinha de Frango Feast.png";
import frozenRissolé from "@/assets/product-images/América FRIOS Rissolé Snack Showcase.png";
import frozenBolinhaNapolitana from "@/assets/product-images/América Frios Bolinha Napolitana Ad.png";
import frozenCoxinhaPackaging from "@/assets/product-images/Coxinha de Frango Packaging Advertisement.png";
import frozenCoxinhaPromo from "@/assets/product-images/Coxinha de Frango Promo Pack.png";
import frozenChurros from "@/assets/product-images/Mini Churros Dulce de Leche Promo.png";

import { toast } from "sonner";
import { QuantityStepper } from "./QuantityStepper";
import { useCart, unitPriceFor } from "@/lib/cart";
import { brl } from "@/lib/order";
import type { Product } from "@/lib/products";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function localProductImage(product: Pick<Product, "id" | "name" | "category" | "image">) {
  const id = normalize(product.id);

  // Mochi Café products sold at América Frios.
  if (id.includes("cafe-especial") || id.includes("cafe-84-pontos") || id.includes("mochi-cafe-especial")) return mochaCafeEspecial;
  if (id.includes("cafe-moido") || id.includes("tradicional-superior")) return mochaCafeMoido;
  if (id.includes("cafe-em-graos") || id.includes("cafe-graos") || id.includes("cafe-em-grao")) return mochaCafeGraos;

  // Uploaded Congelados images — match the product name/slug explicitly.
  if (id.includes("bolinha-de-queijo") || id.includes("bolinha-queijo")) return frozenBolinhaQueijo;
  if (id.includes("bolinha-napolitana")) return frozenBolinhaNapolitana;
  if (id.includes("coxinha-de-frango-com-requeijao") || id.includes("coxinha-frango-requeijao")) return frozenCoxinhaFrango;
  if (id.includes("coxinha-de-frango") || id.includes("coxinha-frango")) return frozenCoxinhaPromo;
  if (id.includes("bolinha-de-milho-com-alho-poro") || id.includes("bolinha-milho-alho-poro")) return frozenRissolé;
  if (id.includes("mini-churros-de-doce-de-leite") || id.includes("mini-churros-doce-de-leite")) return frozenChurros;

  // Existing bundled products.
  if (id.includes("sanduiche-de-presunto-e-queijo") || id.includes("sanduiche-presunto-queijo")) return productSanduiche;
  if (id.includes("linguica-na-chapa")) return productLinguicaChapa;
  if (id.includes("pao-de-alho")) return productPaoAlho;
  if (id.includes("porcao-de-batata-frita") || id.includes("batata-frita")) return productBatataFrita;
  if (id.includes("refrigerante-em-lata")) return productRefriLata;
  if (id.includes("refrigerante-600ml")) return productRefri600;
  if (id.includes("agua-mineral")) return productAguaMineral;
  if (id.includes("agua-com-gas")) return productAguaGas;
  if (id.includes("suco-natural")) return productSucoNatural;

  if (id.includes("espetinho-de-carne") || id.includes("espetinho-carne")) return productCarne;
  if (id.includes("espetinho-de-frango") || id.includes("espetinho-frango")) return productFrango;
  if (id.includes("espetinho-de-linguica") || id.includes("espetinho-linguica")) return productLinguicaEspetinho;
  if (id.includes("espetinho-de-coracao") || id.includes("espetinho-coracao")) return productCoracao;
  if (id.includes("espetinho-de-queijo-coalho") || id.includes("espetinho-queijo-coalho")) return productQueijoEspetinho;
  if (id.includes("espetinho-de-bacon") || id.includes("espetinho-bacon")) return productBacon;

  const key = normalize(`${product.id} ${product.name} ${product.category}`);
  const has = (...terms: string[]) => terms.some((term) => key.includes(normalize(term)));

  if (has("cafe especial", "84 pontos", "mochi cafe especial")) return mochaCafeEspecial;
  if (has("cafe moido", "tradicional superior")) return mochaCafeMoido;
  if (has("cafe em graos", "cafe graos", "grao tradicional superior")) return mochaCafeGraos;
  if (has("bolinha de queijo", "bolinha-queijo")) return frozenBolinhaQueijo;
  if (has("bolinha napolitana", "bolinha-napolitana")) return frozenBolinhaNapolitana;
  if (has("coxinha de frango com requeijao", "coxinha-frango-requeijao")) return frozenCoxinhaFrango;
  if (has("coxinha de frango", "coxinha-frango")) return frozenCoxinhaPromo;
  if (has("bolinha de milho com alho-poro", "bolinha-milho-alho-poro")) return frozenRissolé;
  if (has("mini churros de doce de leite", "mini-churros-doce-de-leite")) return frozenChurros;

  if (has("sanduiche de presunto e queijo", "sanduiche-presunto-queijo")) return productSanduiche;
  if (has("linguica na chapa", "linguica-na-chapa")) return productLinguicaChapa;
  if (has("pao de alho", "pao-de-alho")) return productPaoAlho;
  if (has("porcao de batata frita", "batata-frita")) return productBatataFrita;
  if (has("refrigerante em lata", "refrigerante-em-lata")) return productRefriLata;
  if (has("refrigerante 600ml", "refrigerante-600ml", "600 ml")) return productRefri600;
  if (has("agua mineral", "agua-mineral")) return productAguaMineral;
  if (has("agua com gas", "agua-com-gas", "agua gas")) return productAguaGas;
  if (has("suco natural", "suco-natural")) return productSucoNatural;

  if (has("espetinho de alcatra", "espetinho-alcatra", "alcatra", "espetinho de contra file", "espetinho-contra-file", "contra file", "contrafile", "espetinho de costelinha suina", "espetinho-costelinha-suina", "costelinha suina", "espetinho de cupim", "espetinho-cupim", "cupim", "espetinho de carne", "espetinho-carne", "picanha", "maminha", "fraldinha", "ancho", "file mignon", "coxao")) return productCarne;
  if (has("espetinho de frango", "espetinho-frango", "espetinho frango")) return productFrango;
  if (has("espetinho de linguica", "espetinho-linguica")) return productLinguicaEspetinho;
  if (has("espetinho de coracao", "espetinho-coracao", "coracao de frango")) return productCoracao;
  if (has("espetinho de queijo coalho", "espetinho-queijo-coalho")) return productQueijoEspetinho;
  if (has("espetinho de bacon", "espetinho-bacon")) return productBacon;

  if (has("linguica toscana", "linguica-toscana", "toscana")) return productToscana;
  if (has("linguica calabresa", "linguica-calabresa", "calabresa")) return productCalabresa;
  if (has("linguica defumada", "linguica-defumada", "defumada")) return productDefumada;
  if (has("linguica", "linguiça", "salsicha", "embutido")) return productLinguicaEspetinho;

  if (has("presunto fatiado", "presunto-fatiado", "presunto em fatias")) return productPresuntoFatiado;
  if (has("presunto", "apresuntado", "peito de peru")) return productPresunto;

  if (has("queijo mussarela", "mussarela", "mucarela", "muçarela", "queijo-mussarela")) return productMussarela;
  if (has("queijo prato", "queijo-prato")) return productPrato;
  if (has("queijo coalho", "queijo-coalho")) return productQueijoCoalho;
  if (has("queijo", "queijos")) return productMussarela;

  if (has("salame italiano", "salame-italiano")) return productSalameItaliano;
  if (has("salame fatiado", "salame-fatiado", "salame")) return productSalameFatiado;

  const category = normalize(product.category);
  if (category.includes("espetinho")) return productCarne;
  if (category.includes("carne")) return productCarne;
  if (category.includes("frango")) return productFrango;
  if (category.includes("linguica") || category.includes("embutido")) return productLinguicaEspetinho;
  if (category.includes("queijo")) return productMussarela;
  if (category.includes("presunto") || category.includes("frios")) return productPresunto;
  if (category.includes("salame")) return productSalameFatiado;
  if (category.includes("bebida")) return productRefriLata;
  if (category.includes("congelado")) return productBatataFrita;

  return product.image ?? productPresunto;
}

export function ProductRow({ product }: { product: Product }) {
  const { add, mode, setDrawerOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const { price, wholesaleApplied } = unitPriceFor(product, qty, mode);

  const imageSource = product.image ?? localProductImage(product) ?? productPresunto;
  const fallbackImage = localProductImage({ ...product, image: null }) ?? productPresunto;
  const displayImage = imageFailed ? fallbackImage : imageSource;
  const showImage = Boolean(displayImage);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {showImage ? (
        <img
          src={displayImage!}
          alt={product.name}
          loading="lazy"
          className="aspect-square w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted text-muted-foreground" aria-label={`Imagem de ${product.name} indisponível`}>
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
          {wholesaleApplied && <span className="ml-1 text-xs font-semibold text-primary">· preço de atacado aplicado</span>}
        </p>
        {mode === "varejo" && <p className="text-xs text-muted-foreground">Varejo: {brl(product.retail)} / {product.unit}</p>}
        {mode === "atacado" && !wholesaleApplied && (
          <p className="text-xs text-muted-foreground">Atacado: {brl(product.wholesale)} / {product.unit} · mínimo de {product.wholesaleMin} {product.unit}{product.unit === "unidade" ? "s" : ""}</p>
        )}
        {mode === "atacado" && wholesaleApplied && (
          <p className="text-xs text-muted-foreground">Atacado aplicado a partir de {product.wholesaleMin} {product.unit}{product.unit === "unidade" ? "s" : ""}.</p>
        )}
        <p className="mt-auto pt-2 text-[11px] text-muted-foreground">
          O valor exibido é por {product.unit}. Para produtos vendidos por peso, o valor final pode variar conforme a quantidade pesada e será confirmado pelo WhatsApp.
        </p>
      </div>
      <div className="flex flex-col gap-2 border-t border-border p-4">
        <div className="flex items-center gap-2">
          <QuantityStepper value={qty} onChange={setQty} />
          <span className="text-xs text-muted-foreground">Quantidade</span>
        </div>
        <button type="button" onClick={() => { add(product.id, qty); setQty(1); setDrawerOpen(true); toast.success(`${product.name} adicionado ao carrinho`); }} className="btn-base btn-brand w-full justify-center px-4 py-2 text-sm">
          <ShoppingCart className="h-4 w-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}
