import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { site } from "@/lib/site";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AGIKA Technologies Admin" },
      { name: "description", content: "Store settings for AGIKA Technologies." },
      { property: "og:title", content: "Settings — AGIKA Technologies Admin" },
      { property: "og:description", content: "Store settings for AGIKA Technologies staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <>
      <AdminPageHeader title="Settings" description="Store details used across the website." />
      <dl className="max-w-md rounded-xl border border-black/10 bg-white p-6 text-sm">
        <div className="flex justify-between border-b border-black/5 py-2">
          <dt className="text-muted-foreground">Business</dt>
          <dd className="font-medium">{site.name}</dd>
        </div>
        <div className="flex justify-between border-b border-black/5 py-2">
          <dt className="text-muted-foreground">Phone / WhatsApp</dt>
          <dd className="font-medium">{site.phone}</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt className="text-muted-foreground">Location</dt>
          <dd className="font-medium">{site.location}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted-foreground">Editable settings are coming next.</p>
    </>
  ),
});
