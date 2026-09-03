import { createFileRoute, Outlet, redirect, useRouterState, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/admin/login")) return {};
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    return { user: data.user, isAdmin: Boolean(role) };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const context = Route.useRouteContext() as { isAdmin?: boolean };

  if (pathname.startsWith("/admin/login")) return <Outlet />;

  if (!context.isAdmin) {
    return (
      <AdminShell>
        <div className="rounded-xl border border-black/10 bg-white p-8">
          <h1 className="font-display text-2xl font-bold">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have permission to perform this action. Ask an existing administrator to grant your account admin
            access, then reload this page.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-brand underline">
            Back to store
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
