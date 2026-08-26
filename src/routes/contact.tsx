import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Section } from "@/components/site/PageShell";
import { site, waLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AGIKA Technologies — Nairobi, Kenya" },
      {
        name: "description",
        content:
          "Talk to AGIKA Technologies in Nairobi. Call or WhatsApp 0743852456 for technology products, IT services and business enquiries.",
      },
      { property: "og:title", content: "Contact AGIKA Technologies" },
      { property: "og:description", content: "Call or WhatsApp 0743852456 · Nairobi, Kenya." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "AGIKA Technologies",
          telephone: "+254743852456",
          slogan: "Your Trusted IT Partner",
          address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const socials = [
    { label: "Facebook", href: site.social.facebook, Icon: Facebook },
    { label: "Instagram", href: site.social.instagram, Icon: Instagram },
    { label: "TikTok", href: site.social.tiktok, Icon: Music2 },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to AGIKA Technologies"
        description="Questions about a product, a repair or a business setup? We are happy to help."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold">{site.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{site.tagline}</p>
              <div className="mt-4 space-y-3 text-sm">
                <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:text-brand">
                  <Phone className="h-4 w-4 text-brand" /> {site.phone}
                </a>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-brand" /> {site.location}
                </p>
              </div>
              <Button asChild className="mt-5 w-full">
                <a href={waLink("Hello AGIKA Technologies, I have an enquiry.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow us</p>
                <div className="mt-2 flex gap-2">
                  {socials.map(({ label, href, Icon }) =>
                    href ? (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-brand hover:text-brand"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ) : (
                      <span
                        key={label}
                        aria-label={`${label} (link to be configured)`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-border text-muted-foreground/60"
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message captured", {
                description: "Connect the backend to route contact messages to your inbox.",
              });
            }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-xl font-bold">Send us a message</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-phone">Phone</Label>
                <Input id="c-phone" type="tel" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="c-subject">Subject</Label>
                <Input id="c-subject" className="mt-1.5" />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="c-message">Message</Label>
              <Textarea id="c-message" rows={5} required className="mt-1.5" />
            </div>
            <Button type="submit" className="mt-5">
              Send Message
            </Button>
          </form>
        </div>
      </Section>
    </>
  );
}
