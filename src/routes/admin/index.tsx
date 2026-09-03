import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Plus, ShoppingCart, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { formatKes } from "@/lib/site";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AGIKA Technologies" },
      { name: "description", content: "Overview of the AGIKA Technologies catalogue, orders and customers." },
      { property: "og:title", content: "Admin Dashboard — AGIKA Technologies" },
      { property: "og:description", content: "Internal dashboard for AGIKA Technologies staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [count, setCount] = useState<number | null>(null);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count: total } = await supabase.from("products").select("id", { count: "exact", head: true });
      setCount(total ?? 0);
      const { data } = await supabase
        .from("products")
        .select("price")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatestPrice(data ? Number(data.price) : null);
    })();
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Welcome back. Here is a snapshot of your AGIKA Technologies store."
        action={
          <Button asChild className="bg-gradient-to-r from-[#00BFFF] to-[#7A5FFF] text-white hover:opacity-90">
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add new product
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Package} label="Products" value={count === null ? "…" : String(count)} hint="In the catalogue" />
        <StatCard
          icon={ShoppingCart}
          label="Latest product price"
          value={latestPrice === null ? "—" : formatKes(latestPrice)}
          hint="Most recently added"
        />
        <StatCard icon={Users} label="Customers" value="—" hint="Coming soon" />
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-gradient-to-br from-[#00BFFF]/15 to-[#7A5FFF]/15 p-2 text-[#00BFFF]">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-4 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
