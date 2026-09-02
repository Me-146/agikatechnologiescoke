import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Section } from "@/components/site/PageShell";
import { formatKes } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — AGIKA Technologies" },
      { name: "description", content: "Manage the AGIKA Technologies product catalogue: add products, pricing and images." },
      { property: "og:title", content: "Admin Dashboard — AGIKA Technologies" },
      { property: "og:description", content: "Internal product management for AGIKA Technologies." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type ProductRow = {
  id: string;
  title: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      if (!active) return;
      setIsAdmin(Boolean(data));
      setChecking(false);
      if (data) loadProducts();
    })();
    return () => {
      active = false;
    };
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,price,description,image_url,created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error("Could not load products");
      return;
    }
    setProducts((data ?? []) as ProductRow[]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a product image");
      return;
    }
    try {
      setStatus("uploading");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: signed, error: signedError } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signedError) throw signedError;

      setStatus("saving");
      const { data: userData } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("products").insert({
        title: title.trim(),
        price: Number(price),
        description: description.trim() || null,
        image_url: signed.signedUrl,
        created_by: userData.user?.id ?? null,
      });
      if (insertError) throw insertError;

      toast.success("Product added");
      setTitle("");
      setPrice("");
      setDescription("");
      setFile(null);
      (document.getElementById("product-image") as HTMLInputElement | null)?.value &&
        ((document.getElementById("product-image") as HTMLInputElement).value = "");
      loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save product");
    } finally {
      setStatus("idle");
    }
  }

  if (checking) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Access restricted" description="Your account does not have administrator rights." />
        <Section>
          <p className="text-sm text-muted-foreground">
            Ask an existing administrator to grant your account admin access, then reload this page.{" "}
            <Link to="/" className="text-brand underline">
              Back to store
            </Link>
          </p>
        </Section>
      </>
    );
  }

  const busy = status !== "idle";

  return (
    <>
      <PageHeader eyebrow="Admin" title="Product management" description="Add new products to the AGIKA catalogue." />
      <Section title="Create new product">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Product details</CardTitle>
            <CardDescription>Title, price, description and a product photo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="HP EliteBook 840 G7" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KSh</span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="pl-12"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specs, condition, warranty…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-image">Product image (.jpg, .png)</Label>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {status === "uploading" ? "Uploading..." : status === "saving" ? "Saving..." : "Add product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Section>

      <Section title="Recent products" description="The 20 most recently added products.">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {p.image_url && (
                  <img src={p.image_url} alt={p.title} loading="lazy" className="h-40 w-full object-cover" />
                )}
                <CardContent className="p-4">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-brand">{formatKes(Number(p.price))}</p>
                  {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
