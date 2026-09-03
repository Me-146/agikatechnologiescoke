import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { formatKes } from "@/lib/site";
import { removeStorageObject, storagePathFromUrl, type ProductRow } from "@/lib/admin-products";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({
    meta: [
      { title: "Manage Products — AGIKA Technologies Admin" },
      { name: "description", content: "View, edit and remove products in the AGIKA Technologies catalogue." },
      { property: "og:title", content: "Manage Products — AGIKA Technologies Admin" },
      { property: "og:description", content: "Product management for AGIKA Technologies staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id,title,price,description,image_url,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[admin] load products failed", error);
      toast.error("Unable to load products. Please try again.");
    }
    setProducts((data ?? []) as ProductRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("products").delete().eq("id", target.id);
      if (error) throw error;
      await removeStorageObject(storagePathFromUrl(target.image_url));
      toast.success("Product deleted.");
      setTarget(null);
      load();
    } catch (err) {
      console.error("[admin] delete product failed", err);
      toast.error("Unable to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Everything currently stored in your product catalogue."
        action={
          <Button asChild className="bg-gradient-to-r from-[#00BFFF] to-[#7A5FFF] text-white hover:opacity-90">
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add new product
            </Link>
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/15 bg-white p-10 text-center">
          <p className="text-sm text-muted-foreground">No products yet. Add your first product to get started.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-black/10 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0B12] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-black/5">
                    <td className="px-4 py-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} loading="lazy" className="h-12 w-12 rounded-md object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-[#00BFFF]">{formatKes(Number(p.price))}</td>
                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">{p.description ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/admin/products/$id/edit" params={{ id: p.id }}>
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setTarget(p)}>
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="rounded-xl border border-black/10 bg-white p-4">
                <div className="flex gap-3">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.title} loading="lazy" className="h-20 w-20 rounded-md object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-sm text-[#00BFFF]">{formatKes(Number(p.price))}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{p.description ?? "—"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-KE")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="h-11">
                    <Link to="/admin/products/$id/edit" params={{ id: p.id }}>
                      <Pencil className="mr-1 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" className="h-11" onClick={() => setTarget(p)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.title} will be permanently removed from the catalogue, along with its image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
