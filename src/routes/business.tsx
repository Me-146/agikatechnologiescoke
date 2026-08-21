import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Section } from "@/components/site/PageShell";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business & Bulk Technology Orders in Kenya | AGIKA Technologies" },
      {
        name: "description",
        content:
          "Bulk computer purchases, office setup, networking, CCTV, POS systems and IT support for businesses, schools and institutions in Kenya.",
      },
      { property: "og:title", content: "Technology Solutions For Your Business | AGIKA Technologies" },
      {
        property: "og:description",
        content: "Request a business quote for bulk computers, networking, CCTV, POS and IT support.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/business" },
    ],
    links: [{ rel: "canonical", href: "/business" }],
  }),
  component: BusinessPage,
});

const offerings = [
  "Bulk computer purchases",
  "Office setup",
  "Networking",
  "CCTV",
  "POS systems",
  "Printers",
  "IT accessories",
  "Maintenance",
  "Technical support",
];

function BusinessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Business"
        title="Technology Solutions For Your Business"
        description="Equipping offices, schools and institutions with the right technology — supplied, installed and supported."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold">What we supply and support</h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {offerings.map((o) => (
                <li key={o} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                  {o}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Tell us your requirements and quantities and we will prepare a written quotation, including delivery,
              installation and support options.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Quote request captured", {
                description: "Connect the backend to deliver these requests to your inbox automatically.",
              });
            }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-xl font-bold">Request a Business Quote</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="b-name" label="Name" required />
              <Field id="b-company" label="Company" />
              <Field id="b-phone" label="Phone" type="tel" required />
              <Field id="b-email" label="Email" type="email" />
              <Field id="b-item" label="Product / service required" required />
              <Field id="b-qty" label="Quantity" type="number" />
              <Field id="b-budget" label="Budget (KES)" />
            </div>
            <div className="mt-4">
              <Label htmlFor="b-notes">Additional requirements</Label>
              <Textarea id="b-notes" className="mt-1.5" rows={4} />
            </div>
            <Button type="submit" className="mt-5 w-full">
              Request a Business Quote
            </Button>
          </form>
        </div>
      </Section>
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} required={required} className="mt-1.5" />
    </div>
  );
}
