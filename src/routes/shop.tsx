import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageShell";
import { ShopBrowser, type ShopFilters } from "@/components/site/ShopBrowser";

function str(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return typeof v !== "undefined" && v !== "" && Number.isFinite(n) ? n : undefined;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopFilters => ({
    q: str(search["q"]),
    category: str(search["category"]),
    brand: str(search["brand"]),
    stock: str(search["stock"]),
    min: num(search["min"]),
    max: num(search["max"]),
    sort: str(search["sort"]),
  }),
  head: () => ({
    meta: [
      { title: "Shop Computers, Accessories & IT Equipment | AGIKA Technologies" },
      {
        name: "description",
        content:
          "Buy laptops, desktops, accessories, printers, networking, CCTV, gaming, POS and Apple products in Kenya. Countrywide delivery from Nairobi.",
      },
      { property: "og:title", content: "Shop Technology Products | AGIKA Technologies" },
      {
        property: "og:description",
        content: "Computers, accessories, printers, networking, CCTV and more — delivered across Kenya.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="All Technology Products"
        description="Search and filter our full catalogue by category, brand, price and availability."
      />
      <ShopBrowser
        filters={search}
        onFiltersChange={(next) => navigate({ search: next, replace: true })}
      />
    </>
  );
}
