import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — AGIKA Technologies Admin" },
      { name: "description", content: "Order management for the AGIKA Technologies store." },
      { property: "og:title", content: "Orders — AGIKA Technologies Admin" },
      { property: "og:description", content: "Order management for AGIKA Technologies staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <AdminPageHeader title="Orders" description="Order management is coming next." />
      <div className="rounded-xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-muted-foreground">
        Customer orders will appear here once online checkout is switched on.
      </div>
    </>
  ),
});
