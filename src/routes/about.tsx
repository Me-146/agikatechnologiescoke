import { createFileRoute, Link } from "@tanstack/react-router";
import { Handshake, Rocket, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageShell";
import { site } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AGIKA Technologies — Built From Scratch, Driven By Technology" },
      {
        name: "description",
        content:
          "AGIKA Technologies began in June 2019 in Nairobi, growing from online marketing into a technology sales and IT services business serving Kenya.",
      },
      { property: "og:title", content: "About AGIKA Technologies" },
      {
        property: "og:description",
        content: "Our story: a Kenyan technology business built from scratch since June 2019.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  { icon: ShieldCheck, title: "Reliable Technology", text: "Quality-focused products and solutions." },
  { icon: Users, title: "Professional Support", text: "Assistance before and after purchase." },
  { icon: Rocket, title: "Convenient Shopping", text: "Browse and order from anywhere." },
  { icon: Handshake, title: "Customer Focused", text: "We help customers choose technology that actually fits." },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Built From Scratch. Driven By Technology."
        description={`${site.name} · ${site.tagline} · ${site.location}`}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              AGIKA Technologies began in {site.founded} with a simple ambition: to build a technology business that
              could help people and businesses access reliable technology products and professional IT services.
            </p>
            <p>
              The company gradually expanded its online presence, using platforms such as Facebook, Instagram, TikTok, X
              and other digital channels to connect with customers across Kenya.
            </p>
            <p>
              Today, AGIKA Technologies is developing into a complete technology sales and service platform offering
              products, technical support and digital solutions — from a single laptop for a student to a full office
              setup for a growing company.
            </p>
            <p>
              The long-term vision is to build a trusted technology brand originating from Kenya and capable of serving
              customers beyond Kenya.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5">
                <Icon className="h-5 w-5 text-brand" />
                <h2 className="mt-3 font-display text-base font-bold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="surface-dark-section flex flex-col items-start justify-between gap-5 rounded-3xl p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold">Ready to work with us?</h2>
            <p className="mt-2 text-sm text-surface-dark-muted">
              Shop our catalogue online or talk to our team about your technology needs.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/contact">Contact AGIKA</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
