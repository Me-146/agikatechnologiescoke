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
import { ProductExtraFields, emptyExtras, extrasToRow } from "@/components/admin/ProductExtraFields";
import { assertAdmin, removeStorageObject, uploadProductImage, validateImage } from "@/lib/admin-products";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({
    meta: [
      { title: "Create New Product — AGIKA Technologies Admin" },
      { name: "description", content: "Add a new product with title, price, description and image to the AGIKA catalogue." },
      { property: "og:title", content: "Create New Product — AGIKA Technologies Admin" },
      { property: "og:description", content: "Add a product to the AGIKA Technologies catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [extras, setExtras] = useState(emptyExtras);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

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
    if (status !== "idle") return;

    const priceValue = Number(price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error("Please enter a price greater than zero.");
      return;
    }
    const ex = extrasToRow(extras, priceValue);
    if ("error" in ex) {
      toast.error(ex.error);
      return;
    }
    if (!file) {
      toast.error("Please upload a JPG or PNG image.");
      return;
    }
    const problem = validateImage(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    let uploadedPath: string | null = null;
    try {
      const uid = await assertAdmin();
      setStatus("uploading");
      const uploaded = await uploadProductImage(file);
      uploadedPath = uploaded.path;

      setStatus("saving");
      const { error } = await supabase.from("products").insert({
        title: title.trim(),
        price: priceValue,
        description: description.trim(),
        image_url: uploaded.url,
        created_by: uid,
        ...ex.row,
      });
      if (error) {
        console.error("[admin] product insert failed", error);
        await removeStorageObject(uploadedPath);
        throw new Error("Unable to save product. Please try again.");
      }

      toast.success(ex.row.published ? "Product created and published." : "Product created successfully. It is currently unpublished.");
      setExtras(emptyExtras);
      setTitle("");
      setPrice("");
      setDescription("");
      setFile(null);
      setPreview(null);
      navigate({ to: "/admin/products" });
    } catch (err) {
      console.error("[admin] create product failed", err);
      toast.error(err instanceof Error ? err.message : "Unable to save product. Please try again.");
    } finally {
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <>
      <AdminPageHeader
        title="Create New Product"
        description="Add a product to the AGIKA Technologies catalogue."
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
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="HP EliteBook 840 G7" />
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
                placeholder="42500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specs, condition, warranty…"
            />
          </div>

          <ProductExtraFields value={extras} onChange={setExtras} />

          <div className="space-y-2">
            <Label htmlFor="product-image">Product image (JPG or PNG, max 5MB)</Label>
            <Input id="product-image" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={onPickFile} />
            {preview && (
              <img src={preview} alt="Selected product preview" className="mt-3 h-40 w-40 rounded-lg border object-cover" />
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-[#00BFFF] to-[#7A5FFF] text-white hover:opacity-90 sm:w-auto"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "uploading" ? "Uploading..." : status === "saving" ? "Adding Product..." : "Add Product"}
          </Button>
        </fieldset>
      </form>
    </>
  );
}
