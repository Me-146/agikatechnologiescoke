import { useEffect, useMemo, useState } from "react";
import { MessageCircle, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreProductCard } from "./StoreProductCard";
import { waLink } from "@/lib/site";
import {
  fetchBrands,
  fetchCategories,
  fetchPublishedProducts,
  type Brand,
  type Category,
  type StoreProduct,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export type ShopFilters = {
  q?: string | undefined;
  category?: string | undefined;
  brand?: string | undefined;
  stock?: string | undefined;
  min?: number | undefined;
  max?: number | undefined;
  sort?: string | undefined;
};

const ANY = "any";

export function ShopBrowser({
  filters,
  onFiltersChange,
  lockedCategorySlug,
}: {
  filters?: ShopFilters;
  onFiltersChange?: (next: ShopFilters) => void;
  lockedCategorySlug?: string;
}) {
  const [local, setLocal] = useState<ShopFilters>(filters ?? {});
  const current = filters ?? local;

  function update(patch: Partial<ShopFilters>) {
    const next = { ...current, ...patch };
    setLocal(next);
    onFiltersChange?.(next);
  }

  const [taxonomy, setTaxonomy] = useState<{ categories: Category[]; brands: Brand[] }>({
    categories: [],
    brands: [],
  });
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [showFilters, setShowFilters] = useState(false);
  const [term, setTerm] = useState(current.q ?? "");

  useEffect(() => {
    setTerm(current.q ?? "");
  }, [current.q]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchBrands()])
      .then(([categories, brands]) => setTaxonomy({ categories, brands }))
      .catch(() => setTaxonomy({ categories: [], brands: [] }));
  }, []);

  const categorySlug = lockedCategorySlug ?? current.category;
  const categoryId = useMemo(
    () => taxonomy.categories.find((c) => c.slug === categorySlug)?.id,
    [taxonomy.categories, categorySlug],
  );
  const brandId = useMemo(
    () => taxonomy.brands.find((b) => b.slug === current.brand)?.id,
    [taxonomy.brands, current.brand],
  );

  const taxonomyReady = taxonomy.categories.length > 0 || taxonomy.brands.length > 0;
  const waitingForTaxonomy = Boolean((categorySlug || current.brand) && !taxonomyReady);

  useEffect(() => {
    if (waitingForTaxonomy) return;
    let cancelled = false;
    setState("loading");
    fetchPublishedProducts({
      ...(categorySlug ? { categoryId: categoryId ?? "00000000-0000-0000-0000-000000000000" } : {}),
      ...(current.brand ? { brandId: brandId ?? "00000000-0000-0000-0000-000000000000" } : {}),
      ...(current.stock === "in-stock" || current.stock === "out-of-stock" ? { stock: current.stock } : {}),
      ...(typeof current.min === "number" ? { minPrice: current.min } : {}),
      ...(typeof current.max === "number" ? { maxPrice: current.max } : {}),
      ...(current.q ? { q: current.q } : {}),
      ...(current.sort === "price-asc" || current.sort === "price-desc" ? { sort: current.sort } : {}),
    })
      .then((rows) => {
        if (cancelled) return;
        setProducts(rows);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [
    waitingForTaxonomy,
    categorySlug,
    categoryId,
    brandId,
    current.brand,
    current.stock,
    current.min,
    current.max,
    current.q,
    current.sort,
  ]);

  const hasFilters = Boolean(
    current.q ||
      (!lockedCategorySlug && current.category) ||
      current.brand ||
      current.stock ||
      current.min ||
      current.max ||
      (current.sort && current.sort !== "newest"),
  );

  function clearAll() {
    setTerm("");
    const next: ShopFilters = lockedCategorySlug ? {} : {};
    setLocal(next);
    onFiltersChange?.(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <form
        className="mb-6 flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: term.trim() || undefined });
        }}
      >
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by product name, description or SKU..."
          aria-label="Search products"
          className="w-full max-w-md"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        <Select value={current.sort ?? "newest"} onValueChange={(v) => update({ sort: v })}>
          <SelectTrigger className="w-[190px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        {state === "ready" && <p className="ml-auto text-sm text-muted-foreground">{products.length} products</p>}
      </form>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={cn("space-y-6", showFilters ? "block" : "hidden lg:block")}>
          {!lockedCategorySlug && (
            <FilterGroup title="Category">
              <Select value={current.category ?? ANY} onValueChange={(v) => update({ category: v === ANY ? undefined : v })}>
                <SelectTrigger aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>All categories</SelectItem>
                  {taxonomy.categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterGroup>
          )}

          <FilterGroup title="Brand">
            <Select value={current.brand ?? ANY} onValueChange={(v) => update({ brand: v === ANY ? undefined : v })}>
              <SelectTrigger aria-label="Filter by brand">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All brands</SelectItem>
                {taxonomy.brands.map((b) => (
                  <SelectItem key={b.id} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup title="Availability">
            <Select value={current.stock ?? ANY} onValueChange={(v) => update({ stock: v === ANY ? undefined : v })}>
              <SelectTrigger aria-label="Filter by availability">
                <SelectValue placeholder="Any availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any availability</SelectItem>
                <SelectItem value="in-stock">In stock</SelectItem>
                <SelectItem value="out-of-stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </FilterGroup>

          <FilterGroup title="Price range (KSh)">
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground">
                  Min
                </Label>
                <Input
                  id="min-price"
                  type="number"
                  min="0"
                  value={current.min ?? ""}
                  onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground">
                  Max
                </Label>
                <Input
                  id="max-price"
                  type="number"
                  min="0"
                  value={current.max ?? ""}
                  onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>
          </FilterGroup>

          {hasFilters && (
            <Button variant="outline" className="w-full" onClick={clearAll}>
              <X className="h-4 w-4" /> Clear filters
            </Button>
          )}

          <FilterGroup title="Need help choosing?">
            <p className="text-sm text-muted-foreground">
              Our team can confirm stock, specifications and delivery for any product.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <a href={waLink("Hello AGIKA Technologies, I need help choosing a product.")} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </Button>
          </FilterGroup>
        </aside>

        <div>
          {state === "loading" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-secondary" />
              ))}
            </div>
          ) : state === "error" ? (
            <EmptyPanel
              title="We could not load the catalogue right now."
              body="Please refresh the page in a moment, or message us on WhatsApp and we will help you straight away."
            />
          ) : products.length === 0 ? (
            <EmptyPanel
              title={hasFilters || lockedCategorySlug ? "No products match this selection yet" : "Our catalogue is being updated"}
              body="Try a different filter, or chat with us on WhatsApp and we will source exactly what you need."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <StoreProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-5">
        <a href={waLink("Hello AGIKA Technologies, I would like some help with a product.")} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
      </Button>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-display text-sm font-semibold">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
