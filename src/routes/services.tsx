import { createFileRoute, Link } from "@tanstack/react-router";
import { Cctv, Cpu, Headphones, Printer, Router, ScanLine, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Section } from "@/components/site/PageShell";
import { waLink } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "IT Services in Nairobi — Repair, Networking, CCTV | AGIKA Technologies" },
      {
        name: "description",
        content:
          "Computer repair, networking, CCTV installation, IT support, POS solutions and printer services in Nairobi and across Kenya.",
      },
      { property: "og:title", content: "IT Services in Nairobi | AGIKA Technologies" },
      {
        property: "og:description",
        content: "Professional computer repair, networking, CCTV and IT support services from AGIKA Technologies.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Wrench,
    title: "Computer Repair",
    items: [
      "Laptop repair",
      "Desktop repair",
      "Hardware diagnosis",
      "Software troubleshooting",
      "Operating system installation",
      "Performance optimisation",
    ],
  },
  {
    icon: Router,
    title: "Networking",
    items: ["Router installation", "Wi-Fi setup", "Network configuration", "Office networking", "Troubleshooting"],
  },
  {
    icon: Cctv,
    title: "CCTV & Security",
    items: [
      "CCTV installation",
      "Camera configuration",
      "DVR/NVR setup",
      "Remote viewing configuration",
      "Maintenance",
    ],
  },
  {
    icon: Headphones,
    title: "IT Support",
    items: ["Business IT support", "Computer maintenance", "Software installation", "Technical consultation"],
  },
  {
    icon: ScanLine,
    title: "POS Solutions",
    items: ["POS hardware", "POS setup", "Installation", "Configuration", "Ongoing support"],
  },
  {
    icon: Printer,
    title: "Printer Services",
    items: ["Printer setup", "Installation", "Troubleshooting", "Maintenance"],
  },
];

function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Professional IT Services"
        description="From a single laptop repair to a complete office setup, our technicians handle the technical work so you can get back to business."
      />

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, items }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-brand-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {items.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <div className="surface-dark-section flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-brand">
              <Cpu className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">Need a Solution? Talk to AGIKA Technologies</h2>
            <p className="mt-2 max-w-xl text-sm text-surface-dark-muted">
              Have a custom technology requirement? Tell us what you need and we will design a solution that fits your
              budget and workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href={waLink("Hello AGIKA Technologies, I need help with an IT service.")} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/business">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
