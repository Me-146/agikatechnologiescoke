import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/agika-logo.png";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login — AGIKA Technologies" },
      { name: "description", content: "Secure administrator sign in for the AGIKA Technologies store dashboard." },
      { property: "og:title", content: "Admin Login — AGIKA Technologies" },
      { property: "og:description", content: "Secure administrator sign in for AGIKA Technologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      console.error("[admin] sign in failed", err);
      toast.error("Sign in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B12] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="AGIKA Technologies" className="h-16 w-16 rounded-full" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-white/60">Authorised AGIKA Technologies staff only.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/15 bg-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-[#00BFFF] to-[#7A5FFF] text-white hover:opacity-90"
          >
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
