import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/agika-logo.png";
import { cn } from "@/lib/utils";

const nav: Array<{ to: string; label: string; icon: typeof Package; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const Sidebar = (
    <div className="flex h-full flex-col gap-2 bg-[#0B0B12] p-4 text-white">
      <Link to="/" className="mb-4 flex items-center gap-3">
        <img src={logo} alt="AGIKA Technologies" className="h-10 w-10 rounded-full" />
        <span>
          <span className="block font-display text-sm font-bold leading-tight">AGIKA</span>
          <span className="block text-[11px] uppercase tracking-[0.2em] text-white/50">Admin</span>
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-[#00BFFF]/25 to-[#7A5FFF]/25 text-white ring-1 ring-[#00BFFF]/40"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4">
        <Button variant="outline" onClick={signOut} className="w-full border-white/20 bg-transparent text-white hover:bg-white/10">
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#0B0B12] dark:bg-background dark:text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{Sidebar}</aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 lg:hidden">
            <button aria-label="Open admin menu" onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-black/5">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display font-bold">AGIKA Admin</span>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">
            <button
              aria-label="Close admin menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-2 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
