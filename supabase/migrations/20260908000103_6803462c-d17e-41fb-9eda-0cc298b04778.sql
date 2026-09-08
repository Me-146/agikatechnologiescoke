-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  icon text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories are viewable by everyone" ON public.categories FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BRANDS
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active brands are viewable by everyone" ON public.brands FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins can view all brands" ON public.brands FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update brands" ON public.brands FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete brands" ON public.brands FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCT COLUMNS
ALTER TABLE public.products
  ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN sku text,
  ADD COLUMN sale_price numeric,
  ADD COLUMN stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 3,
  ADD COLUMN specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN stock_status text GENERATED ALWAYS AS (
    CASE WHEN stock_quantity <= 0 THEN 'out-of-stock'
         WHEN stock_quantity <= low_stock_threshold THEN 'low-stock'
         ELSE 'in-stock' END
  ) STORED;

CREATE INDEX products_category_id_idx ON public.products(category_id);
CREATE INDEX products_brand_id_idx ON public.products(brand_id);

-- Existing products keep selling: give them a starting stock level
UPDATE public.products SET stock_quantity = 5 WHERE stock_quantity = 0;

-- SEED CATEGORIES
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Brand New Deals','brand-new-deals','Brand new laptops, desktops and devices with warranty.','sparkles',1),
  ('Ex UK Deals','ex-uk-deals','Quality tested ex-UK laptops and computers at great prices.','laptop',2),
  ('Accessories','accessories','Keyboards, mice, chargers, bags, cables and more.','mouse',3),
  ('Printers & Scanners','printers-scanners','Printers, scanners, copiers and consumables.','printer',4),
  ('Networking','networking','Routers, switches, access points and cabling.','router',5),
  ('Software','software','Genuine operating systems, office and security software.','app-window',6),
  ('Gaming','gaming','Gaming laptops, consoles, chairs and accessories.','gamepad-2',7),
  ('POS Systems','pos-systems','Point of sale terminals, printers and barcode scanners.','scan-line',8),
  ('Apple Products','apple-products','MacBooks, iPads, iPhones and Apple accessories.','apple',9),
  ('Service & Repair','service-repair','Laptop repair, CCTV installation and IT support services.','wrench',10)
ON CONFLICT (slug) DO NOTHING;

-- SEED BRANDS
INSERT INTO public.brands (name, slug) VALUES
  ('HP','hp'),('Dell','dell'),('Lenovo','lenovo'),('Acer','acer'),('Asus','asus'),
  ('Apple','apple'),('Samsung','samsung'),('Canon','canon'),('Epson','epson'),
  ('Logitech','logitech'),('TP-Link','tp-link'),('Hikvision','hikvision'),
  ('Microsoft','microsoft'),('Other / Unbranded','other')
ON CONFLICT (slug) DO NOTHING;

-- SAFE BACKFILL: only where the brand name clearly appears in the product title
UPDATE public.products p SET brand_id = b.id
FROM public.brands b
WHERE p.brand_id IS NULL
  AND b.slug <> 'other'
  AND p.title ILIKE '%' || b.name || '%';