import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageShell";
import { ShopBrowser } from "@/components/site/ShopBrowser";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search["q"] === "string" && search["q"] ? (search["q"] as string) : undefined,
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
  const { q } = Route.useSearch();
  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="All Technology Products"
        description="Search and filter our full catalogue of computers, accessories, office technology, networking and security equipment."
      />
      <ShopBrowser key={q ?? "all"} initialQuery={q ?? ""} />
    </>
  );
}
