import { supabase } from "@/integrations/supabase/client";

/** A product as stored in the database and shown on the public storefront. */
export type StoreProduct = {
  id: string;
  title: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  published: boolean;
};

const COLUMNS = "id,title,price,description,image_url,created_at,published";

function normalise(rows: unknown[]): StoreProduct[] {
  return (rows as StoreProduct[]).map((r) => ({ ...r, price: Number(r.price) }));
}

/** Published products only — unpublished rows are blocked by database policy, not by the browser. */
export async function fetchPublishedProducts(): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[store] load products failed", error);
    throw new Error("catalogue-unavailable");
  }
  return normalise(data ?? []);
}

export async function fetchProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .in("id", ids)
    .eq("published", true);
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
  const product = { ...(data as StoreProduct), price: Number(data.price) };
  return { status: "ok", product, preview: !product.published };
}

export function productInquiryMessage(title: string) {
  return `Hello AGIKA Technologies, I am interested in ${title}. Please provide availability and delivery information.`;
}
