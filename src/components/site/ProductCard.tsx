import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./ProductImage";
import { discountPercent, type Product } from "@/lib/catalog";
import { formatKes } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWishlist, isWishlisted } = useCart();
  const discount = discountPercent(product);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-glow">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block"
        aria-label={product.name}
      >
        <ProductImage category={product.category} name={product.name} className="aspect-4/3 w-full" />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {discount > 0 && <Badge className="bg-accent text-accent-foreground">-{discount}%</Badge>}
          <Badge variant="secondary" className="text-[11px]">
            {product.condition}
          </Badge>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.slug);
          toast.success(isWishlisted(product.slug) ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label={`Save ${product.name} to wishlist`}
        className="absolute right-3 top-3 rounded-full border border-border bg-background/90 p-2 text-muted-foreground transition-colors hover:text-accent"
      >
        <Heart className={cn("h-4 w-4", isWishlisted(product.slug) && "fill-accent text-accent")} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground hover:text-brand"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-brand text-brand" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
          <span className={cn("ml-auto font-medium", product.inStock ? "text-brand" : "text-destructive")}>
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-foreground">{formatKes(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatKes(product.oldPrice)}</span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!product.inStock}
              onClick={() => {
                add(product.slug);
                toast.success("Added to cart", { description: product.name });
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add
            </Button>
            <Button size="sm" asChild disabled={!product.inStock}>
              <Link to="/product/$slug" params={{ slug: product.slug }}>
                Buy Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
