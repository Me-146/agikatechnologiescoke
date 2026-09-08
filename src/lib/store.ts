import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  active: boolean;
};

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type ProductSpec = { label: string; value: string };

/** A product as stored in the database and shown on the public storefront. */
export type StoreProduct = {
  id: string;
  title: string;
  price: number;
  sale_price: number | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  published: boolean;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  stock_status: StockStatus;
  specifications: ProductSpec[];
  category_id: string | null;
  brand_id: string | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
};

const COLUMNS =
  "id,title,price,sale_price,description,image_url,created_at,published,sku,stock_quantity,low_stock_threshold,stock_status,specifications,category_id,brand_id,category:categories(id,name,slug),brand:brands(id,name,slug)";

function normalise(rows: unknown[]): StoreProduct[] {
  return (rows as StoreProduct[]).map(normaliseOne);
}

function normaliseOne(row: unknown): StoreProduct {
  const r = row as StoreProduct & { specifications: unknown };
  return {
    ...r,
    price: Number(r.price),
    sale_price: r.sale_price === null || r.sale_price === undefined ? null : Number(r.sale_price),
    specifications: Array.isArray(r.specifications) ? (r.specifications as ProductSpec[]) : [],
  };
}

/** The price a customer actually pays. */
export function effectivePrice(p: StoreProduct): number {
  return p.sale_price && p.sale_price > 0 && p.sale_price < p.price ? p.sale_price : p.price;
}

export function stockLabel(status: StockStatus): string {
  if (status === "out-of-stock") return "Out of Stock";
  if (status === "low-stock") return "Low Stock";
  return "In Stock";
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon,image_url,active,sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[store] load categories failed", error);
    throw new Error("catalogue-unavailable");
  }
  return (data ?? []) as Category[];
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("id,name,slug,description,logo_url,active")
    .eq("active", true)
    .order("name", { ascending: true });
  if (error) {
    console.error("[store] load brands failed", error);
    throw new Error("catalogue-unavailable");
  }
  return (data ?? []) as Brand[];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon,image_url,active,sort_order")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("[store] load category failed", error);
    throw new Error("catalogue-unavailable");
  }
  return (data as Category | null) ?? null;
}

export type ProductFilters = {
  categorySlug?: string | undefined;
  brandSlug?: string | undefined;
  stock?: "in-stock" | "out-of-stock" | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  q?: string | undefined;
  sort?: "newest" | "price-asc" | "price-desc" | undefined;
};

/**
 * Published products only, filtered in the database through real category and
 * brand relationships — never by matching text inside the product title.
 */
export async function fetchPublishedProducts(filters: ProductFilters = {}): Promise<StoreProduct[]> {
  let query = supabase.from("products").select(COLUMNS).eq("published", true);

  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.brandId) query = query.eq("brand_id", filters.brandId);
  if (filters.stock === "in-stock") query = query.gt("stock_quantity", 0);
  if (filters.stock === "out-of-stock") query = query.lte("stock_quantity", 0);
  if (typeof filters.minPrice === "number") query = query.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") query = query.lte("price", filters.maxPrice);
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,sku.ilike.%${term}%`);
  }

  if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
  else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("[store] load products failed", error);
    throw new Error("catalogue-unavailable");
  }
  // Inner-style filtering: rows whose joined row was filtered out come back null.
  const rows = (data ?? []).filter((r) => {
    const row = r as { category: unknown; brand: unknown };
    if (filters.categorySlug && !row.category) return false;
    if (filters.brandSlug && !row.brand) return false;
    return true;
  });
  return normalise(rows);
}

export async function fetchProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("products").select(COLUMNS).in("id", ids).eq("published", true);
  if (error) {
    console.error("[store] load cart products failed", error);
    throw new Error("catalogue-unavailable");
  }
  return normalise(data ?? []);
}

export type ProductFetchResult =
  | { status: "ok"; product: StoreProduct; preview: boolean }
  | { status: "not-found" }
  | { status: "error" };

/**
 * Public read of a single product. Admins additionally get an authenticated
 * preview of unpublished products — the row is still not publicly readable.
 */
export async function fetchProductById(id: string): Promise<ProductFetchResult> {
  const { data, error } = await supabase.from("products").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    console.error("[store] load product failed", error);
    return { status: "error" };
  }
  if (!data) return { status: "not-found" };
  const product = normaliseOne(data);
  return { status: "ok", product, preview: !product.published };
}

export function productInquiryMessage(title: string) {
  return `Hello AGIKA Technologies, I am interested in ${title}. Please provide availability and delivery information.`;
}
