import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/site/PageShell";
import { useCart } from "@/lib/cart";
import { formatKes, site, waLink } from "@/lib/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | AGIKA Technologies" },
      { name: "description", content: "Fast, mobile-friendly checkout with M-Pesa and delivery across Kenya." },
      { property: "og:title", content: "Checkout | AGIKA Technologies" },
      { property: "og:description", content: "Complete your technology order with AGIKA Technologies." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const DELIVERY_FEE = 350;

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [method, setMethod] = useState("mpesa");
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Order details captured", {
      description: "Online payment goes live once the backend is connected. Confirm your order on WhatsApp for now.",
    });
  }

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Complete Your Order" description="Fast checkout — no account required." />
      <form onSubmit={submit} className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-border bg-card p-5">
            <legend className="px-2 font-display text-lg font-bold">Delivery details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name" required />
              <Field id="phone" label="Phone number" type="tel" required placeholder="07XX XXX XXX" />
              <Field id="email" label="Email" type="email" />
              <Field id="county" label="County" required placeholder="e.g. Nairobi" />
              <Field id="town" label="Delivery location / town" required />
              <Field id="address" label="Address / landmark" required />
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Delivery instructions</Label>
              <Textarea id="notes" className="mt-1.5" placeholder="Anything we should know about the delivery?" />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-card p-5">
            <legend className="px-2 font-display text-lg font-bold">Payment method</legend>
            <RadioGroup value={method} onValueChange={setMethod} className="gap-3">
              {[
                { id: "mpesa", label: "M-Pesa", hint: "Pay via M-Pesa — recommended" },
                { id: "card", label: "Card payment", hint: "Coming soon" },
                { id: "bank", label: "Bank transfer", hint: "Details shared after order confirmation" },
                { id: "delivery", label: "Pay on delivery", hint: "Where available within Nairobi" },
              ].map((opt) => (
                <Label
                  key={opt.id}
                  htmlFor={opt.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 font-normal"
                >
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <span>
                    <span className="block text-sm font-semibold">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map(({ product, qty }) => (
              <li key={product.slug} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {product.name} × {qty}
                </span>
                <span className="font-medium">{formatKes(product.price * qty)}</span>
              </li>
            ))}
            {items.length === 0 && <li className="text-muted-foreground">Your cart is empty.</li>}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatKes(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery (configurable)</dt>
              <dd>{items.length ? formatKes(DELIVERY_FEE) : formatKes(0)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
              <dt>Total</dt>
              <dd>{formatKes(total)}</dd>
            </div>
          </dl>
          <Button type="submit" className="mt-4 w-full" disabled={items.length === 0}>
            Place Order
          </Button>
          <Button asChild variant="secondary" className="mt-2 w-full">
            <a
              href={waLink("Hello AGIKA Technologies, I would like to complete an order. Here are my items:")}
              target="_blank"
              rel="noreferrer"
            >
              Order on WhatsApp ({site.phone})
            </a>
          </Button>
          <Button asChild variant="ghost" className="mt-1 w-full">
            <Link to="/cart">Back to cart</Link>
          </Button>
        </aside>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} placeholder={placeholder} className="mt-1.5" />
    </div>
  );
}
