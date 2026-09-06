import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Minus, Plus, ShieldCheck, Truck, Heart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreProductImage } from "@/components/site/StoreProductImage";
import { formatKes, site, waLink } from "@/lib/site";
import { fetchProductById, productInquiryMessage, type StoreProduct } from "@/lib/store";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product Details | AGIKA Technologies" },
      {
        name: "description",
        content: "View product details, pricing in Kenyan Shillings and availability from AGIKA Technologies, Nairobi.",
      },
      { property: "og:title", content: "Product Details | AGIKA Technologies" },
      { property: "og:description", content: "Technology products with countrywide delivery across Kenya." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductDetailPage,
});

type State =
  | { kind: "loading" }
  | { kind: "ok"; product: StoreProduct; preview: boolean }
  | { kind: "not-found" }
  | { kind: "error" };

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { add, toggleWishlist, isWishlisted } = useCart();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    fetchProductById(id)
      .then((res) => {
        if (cancelled) return;
        if (res.status === "ok") setState({ kind: "ok", product: res.product, preview: res.preview });
        else if (res.status === "not-found") setState({ kind: "not-found" });
        else setState({ kind: "error" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.kind === "loading") {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="aspect-4/3 w-full animate-pulse rounded-2xl bg-secondary" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-secondary" />
          <div className="h-24 w-full animate-pulse rounded bg-secondary" />
        </div>
      </div>
    );
  }

  if (state.kind !== "ok") {
    const message =
      state.kind === "not-found"
        ? "Product could not be found."
        : "Unable to load this product right now. Please try again.";
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">{message}</h1>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/shop">Browse the shop</Link>
          </Button>
          <Button asChild variant="secondary">
            <a href={waLink("Hello AGIKA Technologies, I need help finding a product.")} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const { product, preview } = state;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link to="/shop" className="hover:text-brand">
          Shop
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      {preview && (
        <p className="mb-6 rounded-xl border border-dashed border-border bg-secondary px-4 py-3 text-sm">
          Admin preview — this product is unpublished and is not visible to customers.
        </p>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        <StoreProductImage
          src={product.image_url}
          name={product.title}
          className="aspect-4/3 w-full rounded-2xl border border-border"
          iconClassName="h-24 w-24"
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AGIKA Technologies</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{product.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary">{preview ? "Unpublished" : "Available"}</Badge>
            <span className="font-medium text-brand">In stock — confirm on WhatsApp</span>
          </div>

          <div className="mt-5 font-display text-3xl font-bold">{formatKes(product.price)}</div>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              disabled={preview}
              onClick={() => {
                add(product.id, qty);
                toast.success("Added to cart", { description: product.title });
              }}
            >
              Add to Cart
            </Button>

            <Button
              asChild={!preview}
              disabled={preview}
              onClick={() => {
                if (!preview) add(product.id, qty);
              }}
            >
              {preview ? <span>Buy Now</span> : <Link to="/checkout">Buy Now</Link>}
            </Button>

            <Button variant="ghost" size="icon" aria-label="Save to wishlist" onClick={() => toggleWishlist(product.id)}>
              <Heart className={isWishlisted(product.id) ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4"} />
            </Button>
          </div>

          <Button asChild variant="secondary" className="mt-4 w-full sm:w-auto">
            <a href={waLink(productInquiryMessage(product.title))} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Ask about this product ({site.phone})
            </a>
          </Button>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-brand" /> Delivery across Kenya
            </p>
            <p className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-brand" /> Quality-checked technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
