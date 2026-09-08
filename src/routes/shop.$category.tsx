import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageShell";
import { ShopBrowser } from "@/components/site/ShopBrowser";
import { Button } from "@/components/ui/button";
import { fetchCategoryBySlug, type Category } from "@/lib/store";

export const Route = createFileRoute("/shop/$category")({
  head: ({ params }) => {
    const title = `Shop ${params.category.replace(/-/g, " ")} | AGIKA Technologies`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Browse this category at AGIKA Technologies, Nairobi. Genuine technology products with countrywide delivery in Kenya.`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: "Technology products delivered across Kenya by AGIKA Technologies." },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/shop/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/shop/${params.category}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category: slug } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchCategoryBySlug(slug)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setState("missing");
          return;
        }
        setCategory(row);
        setState("ok");
      })
      .catch(() => {
        if (!cancelled) setState("missing");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "missing") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">This category is not available.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been renamed or removed. Browse the full shop to find what you need.
        </p>
        <Button asChild className="mt-6">
          <Link to="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title={category?.name ?? "Loading category…"}
        description={category?.description ?? ""}
      />
      {state === "ok" && <ShopBrowser lockedCategorySlug={slug} />}
    </>
  );
}
