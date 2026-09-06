import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/site/PageShell";
import { StoreProductImage } from "@/components/site/StoreProductImage";
import { useCart } from "@/lib/cart";
import { formatKes } from "@/lib/site";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | AGIKA Technologies" },
      { name: "description", content: "Review the technology products in your AGIKA Technologies cart and checkout." },
      { property: "og:title", content: "Your Cart | AGIKA Technologies" },
      { property: "og:description", content: "Review your items and proceed to a fast, mobile-friendly checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

  return (
    <>
      <PageHeader eyebrow="Cart" title="Your Shopping Cart" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-display text-lg font-semibold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse our catalogue and add the technology you need.</p>
            <Button asChild className="mt-5">
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                  <StoreProductImage
                    src={product.image_url}
                    name={product.title}
                    className="h-24 w-24 shrink-0 rounded-xl"
                    iconClassName="h-8 w-8"
                  />
                  <div className="flex-1">
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="font-display text-sm font-semibold hover:text-brand"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">AGIKA Technologies</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-border">
                        <Button variant="ghost" size="icon" onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity">
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                        <Button variant="ghost" size="icon" onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => remove(product.id)}>
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </div>
                  <p className="font-display font-bold">{formatKes(product.price * qty)}</p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatKes(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-muted-foreground">Calculated at checkout</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Discount code" aria-label="Discount code" />
                <Button variant="outline">Apply</Button>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg font-bold">
                <span>Total</span>
                <span>{formatKes(subtotal)}</span>
              </div>
              <Button asChild className="mt-4 w-full">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
