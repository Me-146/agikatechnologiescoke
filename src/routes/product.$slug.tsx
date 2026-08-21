import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, MessageCircle, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImage } from "@/components/site/ProductImage";
import { ProductCard } from "@/components/site/ProductCard";
import { Section } from "@/components/site/PageShell";
import { discountPercent, getProduct, relatedProducts } from "@/lib/catalog";
import { formatKes, site, waLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable | AGIKA Technologies" }, { name: "robots", content: "noindex" }] };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${formatKes(product.price)} | AGIKA Technologies`;
    const description = `${product.description} ${product.condition}. Buy online in Kenya from AGIKA Technologies.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.sku,
            brand: { "@type": "Brand", name: product.brand },
            description: product.description,
            offers: {
              "@type": "Offer",
              priceCurrency: "KES",
              price: product.price,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: "AGIKA Technologies" },
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, toggleWishlist, isWishlisted } = useCart();
  const [qty, setQty] = useState(1);
  const discount = discountPercent(product);
  const related = relatedProducts(product);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/shop/$category" params={{ category: product.category }} className="hover:text-brand">
            {product.category}
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <ProductImage
              category={product.category}
              name={product.name}
              className="aspect-4/3 w-full rounded-2xl border border-border"
              iconClassName="h-24 w-24"
            />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <ProductImage
                  key={i}
                  category={product.category}
                  name={`${product.name} view ${i + 1}`}
                  className="aspect-square rounded-xl border border-border"
                  iconClassName="h-6 w-6"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.brand}</p>
            <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-brand text-brand" />
                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </span>
              <Badge variant="secondary">{product.condition}</Badge>
              <span className={cn("font-medium", product.inStock ? "text-brand" : "text-destructive")}>
                {product.inStock ? "In stock" : "Out of stock"}
              </span>
              <span className="text-muted-foreground">SKU: {product.sku}</span>
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="font-display text-3xl font-bold">{formatKes(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">{formatKes(product.oldPrice)}</span>
              )}
              {discount > 0 && <Badge className="bg-accent text-accent-foreground">Save {discount}%</Badge>}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>

            <ul className="mt-4 space-y-2 text-sm">
              {product.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>

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
                disabled={!product.inStock}
                onClick={() => {
                  add(product.slug, qty);
                  toast.success("Added to cart", { description: product.name });
                }}
              >
                Add to Cart
              </Button>

              <Button asChild disabled={!product.inStock}>
                <Link to="/checkout" onClick={() => add(product.slug, qty)}>
                  Buy Now
                </Link>
              </Button>

              <Button variant="ghost" size="icon" aria-label="Add to wishlist" onClick={() => toggleWishlist(product.slug)}>
                <Heart className={cn("h-5 w-5", isWishlisted(product.slug) && "fill-accent text-accent")} />
              </Button>
            </div>

            <Button variant="secondary" className="mt-3 w-full sm:w-auto" asChild>
              <a
                href={waLink(
                  `Hello AGIKA Technologies, I am interested in ${product.name}. Please provide availability and delivery information.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4 text-brand" /> Enquire on WhatsApp
              </a>
            </Button>

            <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" /> {product.warranty}
              </p>
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand" /> Nairobi & countrywide delivery
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="specs" className="mt-12">
          <TabsList>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="rounded-2xl border border-border bg-card p-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border pb-2 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="delivery" className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p>
              Delivery within Nairobi and countrywide delivery are available. Delivery charges and timelines depend on
              your location and are confirmed at checkout or on WhatsApp ({site.phone}). Pickup can be arranged.
            </p>
          </TabsContent>
          <TabsContent value="reviews" className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p>
              Verified customer reviews for this product will appear here once submitted and approved. Bought this item?
              Share your experience through our contact page and we will publish it after moderation.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <Section title="You may also need" description="Recommended accessories and related products.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
