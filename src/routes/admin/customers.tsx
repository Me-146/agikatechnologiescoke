import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — AGIKA Technologies Admin" },
      { name: "description", content: "Customer accounts for the AGIKA Technologies store." },
      { property: "og:title", content: "Customers — AGIKA Technologies Admin" },
      { property: "og:description", content: "Customer management for AGIKA Technologies staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <AdminPageHeader title="Customers" description="Customer accounts are coming next." />
      <div className="rounded-xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-muted-foreground">
        Registered customers will be listed here.
      </div>
    </>
  ),
});
