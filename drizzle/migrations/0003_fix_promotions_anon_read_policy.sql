DROP POLICY IF EXISTS "Public reads active promotions" ON public.promotions;

CREATE POLICY "Public reads active promotions"
  ON public.promotions FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Admins and customers read promotions"
  ON public.promotions FOR SELECT
  TO authenticated
  USING (active = true OR public.has_role(auth.uid(), 'admin'));