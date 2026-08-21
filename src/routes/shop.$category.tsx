import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageShell";
import { ShopBrowser } from "@/components/site/ShopBrowser";
import { getCategory } from "@/lib/catalog";

export const Route = createFileRoute("/shop/$category")({
  loader: ({ params }) => {
    const category = getCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found | AGIKA Technologies" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.category.name} in Kenya | AGIKA Technologies`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.category.description} Buy online from AGIKA Technologies, Nairobi.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.category.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/shop/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/shop/${params.category}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  return (
    <>
      <PageHeader eyebrow="Shop" title={category.name} description={category.description} />
      <ShopBrowser fixedCategory={category.slug} />
    </>
  );
}
