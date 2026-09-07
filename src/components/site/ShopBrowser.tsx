import { useEffect, useMemo, useState } from "react";
import { MessageCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreProductCard } from "./StoreProductCard";
import { formatKes, waLink } from "@/lib/site";
import { fetchPublishedProducts, type StoreProduct } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ShopBrowser({ initialQuery = "" }: { initialQuery?: string }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [all, setAll] = useState<StoreProduct[]>([]);

  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchPublishedProducts()
      .then((rows) => {
        if (cancelled) return;
        setAll(rows);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const maxPrice = useMemo(() => (all.length ? Math.max(...all.map((p) => p.price)) : 0), [all]);
  const activePrice = price ?? maxPrice;

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = all.filter((p) => {
      if (term) {
        const haystack = [p.title, p.description ?? ""].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (activePrice && p.price > activePrice) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "newest") list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list;
  }, [all, q, activePrice, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by product name or description..."
          aria-label="Search products"
          className="w-full max-w-md"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[190px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Sort: Relevance</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
        {state === "ready" && <p className="ml-auto text-sm text-muted-foreground">{results.length} products</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={cn("space-y-6", showFilters ? "block" : "hidden lg:block")}>
          <FilterGroup title={`Max price — ${formatKes(activePrice)}`}>
            <Slider
              value={[activePrice]}
              max={maxPrice || 1}
              min={0}
              step={500}
              onValueChange={(v) => setPrice(v[0] ?? maxPrice)}
              aria-label="Maximum price"
            />
          </FilterGroup>
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
          ) : all.length === 0 ? (
            <EmptyPanel
              title="AGIKA Technologies is updating our product catalogue. Please check back soon."
              body="In the meantime, tell us what you are looking for on WhatsApp and we will source it for you."
            />
          ) : results.length === 0 ? (
            <EmptyPanel
              title="No products match your search"
              body="Try a different keyword, or chat with us on WhatsApp and we will source it for you."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
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

export { Label };
