import { createFileRoute } from "@tanstack/react-router";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export const Route = createFileRoute("/admin/brands")({
  head: () => ({
    meta: [
      { title: "Brands — AGIKA Technologies Admin" },
      { name: "description", content: "Create and manage AGIKA Technologies product brands." },
      { property: "og:title", content: "Brands — AGIKA Technologies Admin" },
      { property: "og:description", content: "Manage product brands." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <TaxonomyManager table="brands" singular="Brand" plural="Brands" />,
});
