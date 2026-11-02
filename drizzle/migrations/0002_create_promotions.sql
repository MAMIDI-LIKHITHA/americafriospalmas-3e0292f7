CREATE TABLE public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  badge text,
  image_url text,
  cta_label text,
  cta_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

COMMENT ON TABLE public.promotions IS 'Promotional cards managed in admin and displayed on existing site pages (no dedicated page).';

GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active promotions"
  ON public.promotions FOR SELECT
  TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage promotions"
  ON public.promotions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));