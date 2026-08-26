import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Music2, MapPin, Phone } from "lucide-react";
import { categories } from "@/lib/catalog";
import { site } from "@/lib/site";
import logo from "@/assets/agika-logo.png";

const services = [
  "Computer Repair",
  "Networking",
  "CCTV & Security",
  "IT Support",
  "POS Solutions",
  "Printer Services",
];

export function Footer() {
  const socials = [
    { key: "facebook", label: "Facebook", href: site.social.facebook, Icon: Facebook },
    { key: "instagram", label: "Instagram", href: site.social.instagram, Icon: Instagram },
    { key: "tiktok", label: "TikTok", href: site.social.tiktok, Icon: Music2 },
  ];

  return (
    <footer className="surface-dark-section mt-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <img src={logo} alt="AGIKA Technologies logo" className="h-12 w-12 rounded-full shadow-glow" />
            <div>
              <p className="font-display text-lg font-bold">AGIKA Technologies</p>
              <p className="text-xs text-brand">{site.tagline}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-surface-dark-muted">
            Technology products and professional IT services for individuals, students, businesses, schools and homes
            across Kenya.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:text-brand">
              <Phone className="h-4 w-4 text-brand" /> {site.phone}
            </a>
            <p className="flex items-center gap-2 text-surface-dark-muted">
              <MapPin className="h-4 w-4 text-brand" /> {site.location}
            </p>
          </div>
          <div className="mt-5 flex gap-2">
            {socials.map(({ key, label, href, Icon }) =>
              href ? (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 hover:border-brand hover:text-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ) : (
                <span
                  key={key}
                  title={`${label} link to be configured`}
                  aria-label={`${label} (coming soon)`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-surface-dark-muted/60"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-brand">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm text-surface-dark-muted">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/shop/$category" params={{ category: c.slug }} className="hover:text-brand">
                  {c.short}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-brand">Services</h2>
          <ul className="mt-4 space-y-2 text-sm text-surface-dark-muted">
            {services.map((s) => (
              <li key={s}>
                <Link to="/services" className="hover:text-brand">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-brand">Customer Support</h2>
          <ul className="mt-4 space-y-2 text-sm text-surface-dark-muted">
            <li>
              <Link to="/contact" className="hover:text-brand">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-brand">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-brand">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/business" className="hover:text-brand">
                Business & Bulk Orders
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand">
                About AGIKA
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-surface-dark-muted">
          © {new Date().getFullYear()} AGIKA Technologies · {site.tagline} · Nairobi, Kenya
        </p>
      </div>
    </footer>
  );
}
