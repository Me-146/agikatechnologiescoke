import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Phone, Search, ShoppingCart, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { categories } from "@/lib/catalog";
import { site, waLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { CategoryIcon } from "./ProductImage";
import logo from "@/assets/agika-logo.png";

const mainLinks = [
  { to: "/services", label: "Services" },
  { to: "/business", label: "Business" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/track-order", label: "Track Order" },
] as const;

export function Header() {
  const { count } = useCart();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: q || undefined } });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="surface-dark-section text-center text-xs">
        <p className="px-4 py-2">
          Countrywide delivery from Nairobi · Talk to us on WhatsApp {site.phone}
        </p>
      </div>

      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] overflow-y-auto p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="surface-dark-section flex items-center gap-3 p-5">
                <img src={logo} alt="AGIKA Technologies logo" className="h-11 w-11 rounded-full shadow-glow" />
                <div>
                  <p className="font-display text-lg font-bold">AGIKA Technologies</p>
                  <p className="text-xs text-brand">{site.tagline}</p>
                </div>
              </div>
              <nav className="flex flex-col p-4">
                <Link to="/shop" onClick={() => setOpen(false)} className="py-2 font-medium">
                  Shop All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/shop/$category"
                    params={{ category: c.slug }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm text-muted-foreground"
                  >
                    <CategoryIcon category={c.slug} className="h-4 w-4 text-brand" />
                    {c.name}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                {mainLinks.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 font-medium">
                    {l.label}
                  </Link>
                ))}
                <Link to="/faq" onClick={() => setOpen(false)} className="py-2 font-medium">
                  FAQ
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="AGIKA Technologies home">
            <img src={logo} alt="AGIKA Technologies logo" className="h-10 w-10 rounded-full shadow-glow" />
            <span className="hidden sm:block">
              <span className="block font-display text-base font-bold leading-none">AGIKA</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Technologies</span>
            </span>
          </Link>

          <form onSubmit={submitSearch} className="ml-auto hidden max-w-xl flex-1 items-center gap-2 md:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search laptops, printers, CCTV, routers, SKU..."
                aria-label="Search products"
                className="pl-9"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" aria-label="Call AGIKA">
              <a href={`tel:${site.phone}`}>
                <Phone className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Chat on WhatsApp">
              <a href={waLink("Hello AGIKA Technologies, I would like to make an enquiry.")} target="_blank" rel="noreferrer">
                <MessageCircle className="h-5 w-5 text-brand" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative" aria-label="View cart">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl gap-2 px-4 pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="pl-9"
            />
          </div>
        </form>

        <nav className="hidden border-t border-border lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
            <Link
              to="/shop"
              className="px-3 py-2.5 text-sm font-semibold text-foreground hover:text-brand"
              activeProps={{ className: "text-brand" }}
            >
              Shop
            </Link>
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to="/shop/$category"
                params={{ category: c.slug }}
                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-brand"
                activeProps={{ className: "text-brand" }}
              >
                {c.short}
              </Link>
            ))}
            <span className="mx-2 h-4 w-px bg-border" />
            {mainLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-brand"
                activeProps={{ className: "text-brand" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
