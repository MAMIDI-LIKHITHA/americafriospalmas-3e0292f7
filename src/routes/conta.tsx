import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, RefreshCw, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/order";
import { STATUS_LABELS, type OrderStatus } from "@/lib/orders-db";
import { PhoneOtpLogin } from "@/components/PhoneOtpLogin";
import { displayBrPhone } from "@/lib/phone";

type Profile = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  cep: string | null;
};

type CustomerOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment_type: string;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export const Route = createFileRoute("/conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha Conta | América Frios Palmas" },
      { name: "description", content: "Acesse sua conta, acompanhe seus pedidos e consulte seu histórico na América Frios." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContaPage,
});

function ContaPage() {
  const navigate = useNavigate();
  const { add } = useCart();
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      setSessionReady(true);
      if (data.session) await loadAccount(data.session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setSessionReady(true);
      if (nextSession) await loadAccount(nextSession.user.id);
      else {
        setProfile(null);
        setOrders([]);
        setItems([]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadAccount(userId: string) {
    setLoading(true);
    const [{ data: profileData, error: profileError }, { data: orderData, error: orderError }] =
      await Promise.all([
        supabase.from("profiles").select("id,name,phone,address,complement,neighborhood,city,cep").eq("id", userId).maybeSingle(),
        supabase.from("orders").select("id,order_number,customer_name,customer_phone,customer_email,fulfillment_type,delivery_address,subtotal,delivery_fee,total,status,notes,created_at").eq("customer_id", userId).order("created_at", { ascending: false }),
      ]);

    if (profileError) toast.error("Não foi possível carregar seu perfil.");
    if (orderError) toast.error("Não foi possível carregar seus pedidos.");
    setProfile((profileData as Profile | null) ?? { id: userId, name: "", phone: "", address: "", complement: "", neighborhood: "", city: "", cep: "" });
    const nextOrders = (orderData ?? []) as CustomerOrder[];
    setOrders(nextOrders);

    if (nextOrders.length) {
      const { data: itemData } = await supabase
        .from("order_items")
        .select("id,order_id,product_id,product_name,quantity,unit_price,subtotal")
        .in("order_id", nextOrders.map((o) => o.id))
        .order("created_at", { ascending: true });
      setItems((itemData ?? []) as OrderItem[]);
    } else {
      setItems([]);
    }
    setLoading(false);
  }

  async function saveProfile() {
    if (!session || !profile) return;
    const { error } = await supabase.from("profiles").upsert({
      id: session.user.id,
      name: profile.name.trim(),
      phone: displayBrPhone(session.user.phone) || profile.phone.trim(),
      address: profile.address?.trim() || null,
      complement: profile.complement?.trim() || null,
      neighborhood: profile.neighborhood?.trim() || null,
      city: profile.city?.trim() || null,
      cep: profile.cep?.trim() || null,
    });
    if (error) toast.error("Não foi possível salvar seus dados.");
    else toast.success("Dados atualizados.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta.");
  }

  async function reorder(orderId: string) {
    const orderItems = items.filter((item) => item.order_id === orderId);
    const ids = orderItems.map((i) => i.product_id).filter(Boolean) as string[];
    const { data: prods } = ids.length
      ? await supabase.from("products").select("id,slug,available,active").in("id", ids)
      : { data: [] as { id: string; slug: string | null; available: boolean; active: boolean }[] };
    const byId = new Map((prods ?? []).map((p) => [p.id, p]));
    const added: string[] = [];
    const missing: string[] = [];
    for (const item of orderItems) {
      const p = item.product_id ? byId.get(item.product_id) : undefined;
      if (p && p.slug && p.available && p.active) {
        add(p.slug, Number(item.quantity));
        added.push(item.product_name);
      } else missing.push(item.product_name);
    }
    if (missing.length) toast.warning(`Indisponíveis e não adicionados: ${missing.join(", ")}`);
    if (!added.length) {
      toast.error("Nenhum produto deste pedido está disponível no momento.");
      return;
    }
    toast.success("Itens adicionados ao carrinho. Revise antes de enviar.");
    navigate({ to: "/carrinho" });
  }

  if (!sessionReady || loading) {
    return <div className="container-page py-16 text-center text-muted-foreground">Carregando sua conta…</div>;
  }

  const itemCount = new Map<string, number>();
  for (const item of items) itemCount.set(item.order_id, (itemCount.get(item.order_id) ?? 0) + item.quantity);

  if (!session) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
        <PhoneOtpLogin />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">Minha conta</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">Olá, {profile?.name || session.user.email?.split("@")[0]}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{displayBrPhone(session.user.phone) || session.user.email}</p>
        </div>
        <button type="button" onClick={signOut} className="btn-base btn-outline-brand">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="card-surface h-fit p-5">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Meus dados</h2>
          </div>
          <label className="mt-5 block text-sm font-semibold">Nome completo
            <input className="input-field mt-1.5" value={profile?.name ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, name: e.target.value } : p)} />
          </label>
          <label className="mt-4 block text-sm font-semibold">WhatsApp
            <input className="input-field mt-1.5 opacity-70" readOnly value={displayBrPhone(session.user.phone) || profile?.phone || ""} />
          </label>
          <label className="mt-4 block text-sm font-semibold">Endereço padrão
            <textarea className="input-field mt-1.5" rows={3} value={profile?.address ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, address: e.target.value } : p)} placeholder="Quadra, rua, número..." />
          </label>
          {([["complement","Complemento"],["neighborhood","Bairro"],["city","Cidade"],["cep","CEP"]] as const).map(([k,label]) => (
            <label key={k} className="mt-4 block text-sm font-semibold">{label}
              <input className="input-field mt-1.5" value={profile?.[k] ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, [k]: e.target.value } : p)} />
            </label>
          ))}
          <button type="button" onClick={saveProfile} className="btn-base btn-brand mt-5 w-full">
            <Save className="h-4 w-4" /> Salvar dados
          </button>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Meus pedidos</h2>
              <p className="mt-1 text-sm text-muted-foreground">Todos os pedidos feitos com esta conta ficam aqui.</p>
            </div>
            <Package className="h-7 w-7 text-primary" />
          </div>

          {orders.length === 0 ? (
            <div className="card-surface mt-5 p-8 text-center">
              <p className="font-semibold">Você ainda não fez nenhum pedido.</p>
              <button type="button" onClick={() => navigate({ to: "/produtos" })} className="btn-base btn-brand mt-4">Ver produtos</button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="card-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("pt-BR")} · {itemCount.get(order.id) ?? 0} itens · {order.fulfillment_type === "Pickup" ? "Retirada" : "Entrega"}{order.fulfillment_type !== "Pickup" && order.delivery_address ? ` — ${order.delivery_address}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{STATUS_LABELS[order.status] ?? order.status}</span>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {items.filter((item) => item.order_id === order.id).map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <span>{item.quantity} × {item.product_name}</span>
                        <span className="font-semibold">{brl(Number(item.subtotal))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="ml-2 font-display text-xl font-bold">{brl(Number(order.total))}</span>
                    </div>
                    <button type="button" onClick={() => reorder(order.id)} className="btn-base btn-outline-brand">
                      <RefreshCw className="h-4 w-4" /> Comprar novamente
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

