CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Customers can create their profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Customers can update their profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_created_at ON public.orders(customer_id, created_at DESC);
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
CREATE POLICY "Customers can view their orders" ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.place_order(p_order jsonb, p_items jsonb)
RETURNS TABLE (order_id uuid, order_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid; v_number text;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'order must contain at least one item';
  END IF;
  IF NULLIF(p_order->>'customer_id', '') IS NULL THEN
    RAISE EXCEPTION 'customer account is required';
  END IF;
  INSERT INTO public.orders (order_number, customer_id, customer_name, customer_phone, customer_email,
    order_type, fulfillment_type, store_id, delivery_address, payment_method, subtotal, delivery_fee, total, status, notes)
  VALUES (p_order->>'order_number', (p_order->>'customer_id')::uuid, p_order->>'customer_name', p_order->>'customer_phone',
    NULLIF(p_order->>'customer_email', ''), (p_order->>'order_type')::order_type, (p_order->>'fulfillment_type')::fulfillment_type,
    NULLIF(p_order->>'store_id', '')::uuid, NULLIF(p_order->>'delivery_address', ''), NULLIF(p_order->>'payment_method', ''),
    (p_order->>'subtotal')::numeric, COALESCE((p_order->>'delivery_fee')::numeric, 0), (p_order->>'total')::numeric,
    'new'::order_status, NULLIF(p_order->>'notes', ''))
  RETURNING id, orders.order_number INTO v_id, v_number;
  INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
  SELECT v_id, NULLIF(i->>'product_id', '')::uuid, i->>'product_name', (i->>'quantity')::numeric, (i->>'unit_price')::numeric, (i->>'subtotal')::numeric
  FROM jsonb_array_elements(p_items) AS i;
  RETURN QUERY SELECT v_id, v_number;
END;
$$;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO service_role;