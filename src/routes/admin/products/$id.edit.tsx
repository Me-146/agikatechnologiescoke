import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import {
  assertAdmin,
  removeStorageObject,
  storagePathFromUrl,
  uploadProductImage,
  validateImage,
  type ProductRow,
} from "@/lib/admin-products";

export const Route = createFileRoute("/admin/products/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Product — AGIKA Technologies Admin" },
      { name: "description", content: "Update the title, price, description or image of an AGIKA Technologies product." },
      { property: "og:title", content: "Edit Product — AGIKA Technologies Admin" },
      { property: "og:description", content: "Update a product in the AGIKA Technologies catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,price,description,image_url,created_at")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        console.error("[admin] load product failed", error);
        toast.error("Unable to load this product.");
        setLoading(false);
        return;
      }
      const row = data as ProductRow;
      setProduct(row);
      setTitle(row.title);
      setPrice(String(row.price));
      setDescription(row.description ?? "");
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) {
      setFile(null);
      return;
    }
    const problem = validateImage(picked);
    if (problem) {
      toast.error(problem);
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(picked);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "idle" || !product) return;

    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error("Please enter a price greater than zero.");
      return;
    }

    let newPath: string | null = null;
    try {
      await assertAdmin();
      let imageUrl = product.image_url;

      if (file) {
        setStatus("uploading");
        const uploaded = await uploadProductImage(file);
        newPath = uploaded.path;
        imageUrl = uploaded.url;
      }

      setStatus("saving");
      const { error } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          price: priceValue,
          description: description.trim(),
          image_url: imageUrl,
        })
        .eq("id", product.id);

      if (error) {
        console.error("[admin] product update failed", error);
        if (newPath) await removeStorageObject(newPath);
        throw new Error("Unable to save product. Please try again.");
      }

      // Only after the new image is safely stored do we drop the old one.
      if (newPath) await removeStorageObject(storagePathFromUrl(product.image_url));

      toast.success("Product updated successfully.");
      navigate({ to: "/admin/products" });
    } catch (err) {
      console.error("[admin] edit product failed", err);
      toast.error(err instanceof Error ? err.message : "Unable to save product. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading product…</p>;

  if (!product) {
    return (
      <>
        <AdminPageHeader title="Product not found" description="This product may have been deleted." />
        <Button asChild variant="outline">
          <Link to="/admin/products">Back to products</Link>
        </Button>
      </>
    );
  }

  const busy = status !== "idle";

  return (
    <>
      <AdminPageHeader
        title="Edit product"
        description={product.title}
        action={
          <Button asChild variant="outline">
            <Link to="/admin/products">Back to products</Link>
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="max-w-2xl rounded-xl border border-black/10 bg-white p-6">
        <fieldset disabled={busy} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KSh</span>
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                required
                className="pl-12"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Replace image (optional — JPG or PNG, max 5MB)</Label>
            <Input id="product-image" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={onPickFile} />
            <div className="mt-3 flex gap-4">
              {product.image_url && (
                <figure>
                  <img src={product.image_url} alt={product.title} className="h-40 w-40 rounded-lg border object-cover" />
                  <figcaption className="mt-1 text-xs text-muted-foreground">Current</figcaption>
                </figure>
              )}
              {preview && (
                <figure>
                  <img src={preview} alt="New product preview" className="h-40 w-40 rounded-lg border object-cover" />
                  <figcaption className="mt-1 text-xs text-muted-foreground">New</figcaption>
                </figure>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-[#00BFFF] to-[#7A5FFF] text-white hover:opacity-90 sm:w-auto"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "uploading" ? "Uploading..." : status === "saving" ? "Saving changes..." : "Save changes"}
          </Button>
        </fieldset>
      </form>
    </>
  );
}
