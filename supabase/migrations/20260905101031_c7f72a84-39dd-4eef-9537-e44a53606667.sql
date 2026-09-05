ALTER TABLE public.products ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

UPDATE public.products SET published = true WHERE published = false;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Published products are viewable by everyone"
ON public.products FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all products"
ON public.products FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;