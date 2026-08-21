import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Section } from "@/components/site/PageShell";
import { site, waLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const steps = [
  "Order Received",
  "Payment Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
];

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order | AGIKA Technologies" },
      {
        name: "description",
        content: "Follow your AGIKA Technologies order from confirmation to delivery anywhere in Kenya.",
      },
      { property: "og:title", content: "Track Your Order | AGIKA Technologies" },
      { property: "og:description", content: "Check the status of your technology order with AGIKA Technologies." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/track-order" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [searched, setSearched] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Track Order"
        title="Where Is My Order?"
        description="Enter your order number to see the current status of your delivery."
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearched(true);
            }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <Label htmlFor="order-no">Order number</Label>
            <div className="mt-2 flex gap-2">
              <Input id="order-no" placeholder="e.g. AGK-10245" required />
              <Button type="submit">Track</Button>
            </div>
          </form>

          {searched && (
            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Live order tracking becomes available once orders are stored in the backend. In the meantime, WhatsApp us
              on{" "}
              <a className="font-medium text-brand" href={waLink("Hello AGIKA Technologies, please update me on my order.")}>
                {site.phone}
              </a>{" "}
              with your order number and we will update you right away.
            </p>
          )}

          <div className="mt-10">
            <h2 className="font-display text-lg font-bold">How your order progresses</h2>
            <ol className="mt-5 space-y-4">
              {steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                      i === 0 ? "gradient-brand text-brand-foreground" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>
    </>
  );
}
