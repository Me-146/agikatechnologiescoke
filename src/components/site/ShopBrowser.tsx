import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { categories, products, type CategorySlug, type Condition } from "@/lib/catalog";
import { formatKes } from "@/lib/site";
import { cn } from "@/lib/utils";

const conditions: Condition[] = ["Brand New", "Ex-UK / Refurbished", "Used"];

export function ShopBrowser({
  fixedCategory,
  initialQuery = "",
}: {
  fixedCategory?: CategorySlug;
  initialQuery?: string;
}) {
  const scope = useMemo(
    () => (fixedCategory ? products.filter((p) => p.category === fixedCategory) : products),
    [fixedCategory],
  );
  const maxPrice = useMemo(() => Math.max(...scope.map((p) => p.price)), [scope]);

  const [q, setQ] = useState(initialQuery);
  const [cats, setCats] = useState<CategorySlug[]>([]);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [conds, setConds] = useState<Condition[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [price, setPrice] = useState<number>(maxPrice);
  const [sort, setSort] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const availableBrands = useMemo(() => Array.from(new Set(scope.map((p) => p.brand))).sort(), [scope]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = scope.filter((p) => {
      if (term) {
        const haystack = [
          p.name,
          p.brand,
          p.sku,
          p.category,
          p.description,
          ...Object.values(p.specs),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (cats.length && !cats.includes(p.category)) return false;
      if (brandFilter.length && !brandFilter.includes(p.brand)) return false;
      if (conds.length && !conds.includes(p.condition)) return false;
      if (inStockOnly && !p.inStock) return false;
      if (p.price > price) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [scope, q, cats, brandFilter, conds, inStockOnly, price, sort]);

  function toggle<T>(value: T, list: T[], setter: (v: T[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by product, brand, model, SKU or specification..."
          aria-label="Search products"
          className="w-full max-w-md"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[190px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Sort: Relevance</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        <p className="ml-auto text-sm text-muted-foreground">{results.length} products</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={cn("space-y-6", showFilters ? "block" : "hidden lg:block")}>
          {!fixedCategory && (
            <FilterGroup title="Category">
              {categories.map((c) => (
                <FilterCheck
                  key={c.slug}
                  id={`cat-${c.slug}`}
                  label={c.name}
                  checked={cats.includes(c.slug)}
                  onChange={() => toggle(c.slug, cats, setCats)}
                />
              ))}
            </FilterGroup>
          )}

          <FilterGroup title="Brand">
            {availableBrands.map((b) => (
              <FilterCheck
                key={b}
                id={`brand-${b}`}
                label={b}
                checked={brandFilter.includes(b)}
                onChange={() => toggle(b, brandFilter, setBrandFilter)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Condition">
            {conditions.map((c) => (
              <FilterCheck
                key={c}
                id={`cond-${c}`}
                label={c}
                checked={conds.includes(c)}
                onChange={() => toggle(c, conds, setConds)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={`Max price — ${formatKes(price)}`}>
            <Slider
              value={[price]}
              max={maxPrice}
              min={1000}
              step={500}
              onValueChange={([v]) => setPrice(v)}
              aria-label="Maximum price"
            />
          </FilterGroup>

          <FilterGroup title="Availability">
            <FilterCheck
              id="in-stock"
              label="In stock only"
              checked={inStockOnly}
              onChange={() => setInStockOnly((s) => !s)}
            />
          </FilterGroup>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg font-semibold">No products match your search</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different keyword, or chat with us on WhatsApp and we will source it for you.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
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

function FilterCheck({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-sm font-normal text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}
