import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, MessageCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/site/ProductCard";
import { CategoryIcon } from "@/components/site/ProductImage";
import { Section } from "@/components/site/PageShell";
import { categories, productsByTag } from "@/lib/catalog";
import { site, waLink } from "@/lib/site";
import heroImage from "@/assets/hero-tech.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AGIKA Technologies — Computers, Accessories & IT Services in Kenya" },
      {
        name: "description",
        content:
          "Shop computers, accessories, networking, CCTV, printers, POS and Apple products in Kenya. Professional IT services in Nairobi. Your Trusted IT Partner.",
      },
      { property: "og:title", content: "AGIKA Technologies — Your Trusted IT Partner" },
      {
        property: "og:description",
        content: "Technology products and professional IT services for homes, students and businesses across Kenya.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AGIKA Technologies",
          slogan: "Your Trusted IT Partner",
          telephone: "+254743852456",
          foundingDate: "2019-06",
          address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
        }),
      },
    ],
  }),
  component: Home,
});

const trust = [
  { icon: ShieldCheck, title: "Reliable Technology", text: "Quality-focused products and solutions." },
  { icon: Headphones, title: "Professional Support", text: "Assistance before and after purchase." },
  { icon: Truck, title: "Convenient Shopping", text: "Browse and order from anywhere in Kenya." },
  { icon: Sparkles, title: "Customer Focused", text: "Technology that actually fits your needs." },
];

function Home() {
  const [published, setPublished] = useState<StoreProduct[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedProducts()
      .then((rows) => {
        if (!cancelled) setPublished(rows);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = published?.slice(0, 4) ?? [];
  const newArrivals = published?.slice(4, 8) ?? [];

  return (
    <>
      <section className="surface-dark-section relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-brand">
              <Sparkles className="h-3.5 w-3.5" /> {site.tagline}
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Technology That <span className="text-gradient-brand">Works For You.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-surface-dark-muted sm:text-base">
              Shop computers, accessories, networking equipment, security solutions, office technology and more from
              AGIKA Technologies — Your Trusted IT Partner.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a
                  href={waLink("Hello AGIKA Technologies, I would like to talk to an expert.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Talk to an Expert
                </a>
              </Button>
            </div>
            <p className="mt-8 text-xs text-surface-dark-muted">
              Quality Products · Professional Support · Reliable Service · Customer Focused
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--gradient-brand)] opacity-20 blur-3xl" />
            <img
              src={heroImage}
              alt="Laptop, router, CCTV camera and monitor supplied by AGIKA Technologies"
              width={1600}
              height={1104}
              className="relative w-full rounded-3xl border border-white/10 object-cover shadow-glow"
            />
          </div>
        </div>
      </section>

      <Section title="Shop by category" description="Everything you need, organised the way you shop.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop/$category"
              params={{ category: c.slug }}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-brand text-brand-foreground">
                <CategoryIcon category={c.slug} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-base font-bold group-hover:text-brand">{c.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{c.description}</span>
              </span>
            </Link>
          ))}
          <Link
            to="/services"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-brand text-brand-foreground">
              <Headphones className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-base font-bold group-hover:text-brand">Services</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Computer repair, installation, maintenance, networking and technical support.
              </span>
            </span>
          </Link>
        </div>
      </Section>

      <ProductRow title="Featured Products" products={featured} />
      <ProductRow title="Hot Deals" description="Limited-time prices on popular technology." products={deals} />

      <Section title="Why choose AGIKA">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-brand" />
              <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="surface-dark-section grid gap-6 rounded-3xl p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Technology Solutions For Your Business</h2>
            <p className="mt-3 text-sm text-surface-dark-muted">
              Bulk computer purchases, office setup, networking, CCTV, POS systems, printers, IT accessories,
              maintenance and technical support — supplied and installed by our team.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/business">Request a Business Quote</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {["Bulk computers", "Office setup", "Networking", "CCTV", "POS systems", "IT support"].map((i) => (
              <li key={i} className="rounded-xl border border-white/10 px-4 py-3 text-sm">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <ProductRow title="Best Sellers" products={bestSellers} />
      <ProductRow title="New Arrivals" products={newArrivals} />

      <Section>
        <div className="grid gap-6 rounded-3xl border border-border bg-card p-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Stay Updated With AGIKA</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New products, promotions, deals and practical technology tips. No spam.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Thanks for subscribing!", { description: "We'll keep you posted on new arrivals." });
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <Input placeholder="Your name" aria-label="Your name" required />
            <Input type="email" placeholder="Your email" aria-label="Your email" required />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </Section>

      <Section>
        <div className="flex flex-col items-center gap-4 rounded-3xl gradient-brand p-10 text-center text-brand-foreground">
          <MessageCircle className="h-8 w-8" />
          <h2 className="font-display text-2xl font-bold">Not ready to checkout? Talk to us directly.</h2>
          <p className="max-w-xl text-sm">
            Message AGIKA Technologies on WhatsApp ({site.phone}) and our team will help you choose the right
            technology, confirm stock and arrange delivery.
          </p>
          <Button asChild variant="secondary" size="lg">
            <a href={waLink("Hello AGIKA Technologies, I would like some help choosing a product.")} target="_blank" rel="noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </Section>
    </>
  );
}

function ProductRow({
  title,
  description,
  products,
}: {
  title: string;
  description?: string;
  products: ReturnType<typeof productsByTag>;
}) {
  if (products.length === 0) return null;
  return (
    <Section
      title={title}
      {...(description ? { description } : {})}
      action={
        <Button asChild variant="ghost" size="sm">
          <Link to="/shop">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </Section>
  );
}
