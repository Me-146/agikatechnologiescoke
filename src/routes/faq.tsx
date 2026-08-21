import { createFileRoute } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader, Section } from "@/components/site/PageShell";
import { site } from "@/lib/site";

const faqs = [
  {
    q: "Do you deliver outside Nairobi?",
    a: "Yes. We deliver within Nairobi and countrywide. Delivery availability, charges and timelines depend on your location and are confirmed before your order is dispatched.",
  },
  {
    q: "Do you sell brand-new computers?",
    a: "Yes. We stock brand-new units as well as Ex-UK / refurbished and, where applicable, used equipment. The condition is clearly shown on every product page so you always know what you are buying.",
  },
  {
    q: "Do you offer computer repair?",
    a: "Yes. We provide laptop and desktop repair, hardware diagnosis, software troubleshooting, operating system installation and performance optimisation.",
  },
  {
    q: "Do you install CCTV?",
    a: "Yes. CCTV installation, camera configuration, DVR/NVR setup, remote viewing configuration and maintenance are available where offered.",
  },
  {
    q: "Can I order through WhatsApp?",
    a: `Yes. Contact us on ${site.phone} and we will help you place your order, confirm availability and arrange delivery.`,
  },
  {
    q: "Do you sell to businesses?",
    a: "Yes. Businesses, schools and institutions can request bulk purchases, office setup, networking, CCTV, POS systems and ongoing IT support through our business quote form.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | AGIKA Technologies" },
      {
        name: "description",
        content:
          "Delivery, product conditions, repairs, CCTV installation, WhatsApp orders and business purchases — answers to common AGIKA Technologies questions.",
      },
      { property: "og:title", content: "FAQ | AGIKA Technologies" },
      { property: "og:description", content: "Answers about delivery, repairs, CCTV, warranties and ordering." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Frequently Asked Questions" />
      <Section>
        <Accordion type="single" collapsible className="mx-auto max-w-3xl">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  );
}
