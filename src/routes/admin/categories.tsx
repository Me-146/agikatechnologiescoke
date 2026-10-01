import { createFileRoute } from "@tanstack/react-router";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — AGIKA Technologies Admin" },
      { name: "description", content: "Create and manage AGIKA Technologies shop categories." },
      { property: "og:title", content: "Categories — AGIKA Technologies Admin" },
      { property: "og:description", content: "Manage shop categories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <TaxonomyManager table="categories" singular="Category" plural="Categories" />,
});
