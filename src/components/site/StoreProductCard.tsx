import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoreProductImage } from "./StoreProductImage";
import { formatKes } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/store";

export function StoreProductCard({ product }: { product: StoreProduct }) {
  const { add, toggleWishlist, isWishlisted } = useCart();

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow">
      <Link to="/products/$id" params={{ id: product.id }} className="relative block" aria-label={product.title}>
        <StoreProductImage src={product.image_url} name={product.title} className="aspect-4/3 w-full" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          <Badge variant="secondary" className="text-[11px]">
            In stock
          </Badge>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(isWishlisted(product.id) ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label={`Save ${product.title} to wishlist`}
        className="absolute right-3 top-3 rounded-full border border-border bg-background/90 p-2 text-muted-foreground transition-colors hover:text-accent"
      >
        <Heart className={cn("h-4 w-4", isWishlisted(product.id) && "fill-accent text-accent")} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AGIKA Technologies</p>
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground hover:text-brand"
        >
          {product.title}
        </Link>

        {product.description && <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-foreground">{formatKes(product.price)}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                add(product.id);
                toast.success("Added to cart", { description: product.title });
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
            <Button size="sm" asChild>
              <Link to="/products/$id" params={{ id: product.id }}>
                Buy Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
