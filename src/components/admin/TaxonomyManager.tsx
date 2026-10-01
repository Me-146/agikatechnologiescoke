import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/AdminShell";

type Row = { id: string; name: string; slug: string; description: string | null; active: boolean; icon?: string | null; sort_order?: number };

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const blank = { id: "", name: "", slug: "", description: "", active: true, icon: "", sort_order: "0" };

export function TaxonomyManager({ table, singular, plural }: { table: "categories" | "brands"; singular: string; plural: string }) {
  const isCat = table === "categories";
  const [rows, setRows] = useState<Row[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const cols = isCat ? "id,name,slug,description,active,icon,sort_order" : "id,name,slug,description,active";
    const q = supabase.from(table).select(cols);
    const { data, error } = await (isCat ? q.order("sort_order") : q.order("name"));
    if (error) {
      toast.error(`Unable to load ${plural.toLowerCase()}.`);
      setRows([]);
      return;
    }
    setRows((data ?? []) as unknown as Row[]);
    const key = isCat ? "category_id" : "brand_id";
    const { data: prods } = await supabase.from("products").select(key);
    const c: Record<string, number> = {};
    (prods ?? []).forEach((p) => {
      const id = (p as Record<string, string | null>)[key];
      if (id) c[id] = (c[id] ?? 0) + 1;
    });
    setCounts(c);
  }, [table, isCat, plural]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const slug = slugify(form.slug || name);
    if (!name || !slug) return toast.error("Please enter a name.");
    setBusy(true);
    const payload: Record<string, unknown> = { name, slug, description: form.description.trim() || null, active: form.active };
    if (isCat) {
      payload.icon = form.icon.trim() || null;
      payload.sort_order = Number(form.sort_order) || 0;
    }
    const { error } = form.id
      ? await supabase.from(table).update(payload as never).eq("id", form.id)
      : await supabase.from(table).insert(payload as never);
    setBusy(false);
    if (error) {
      toast.error(error.code === "23505" ? "That name or link already exists." : `Unable to save ${singular.toLowerCase()}.`);
      return;
    }
    toast.success(form.id ? `${singular} updated.` : `${singular} created.`);
    setForm(blank);
    load();
  }

  async function remove(row: Row) {
    if (counts[row.id]) return toast.error(`Move its ${counts[row.id]} product(s) first, or switch it off instead.`);
    if (!confirm(`Delete ${row.name}?`)) return;
    const { error } = await supabase.from(table).delete().eq("id", row.id);
    if (error) return toast.error(`Unable to delete ${singular.toLowerCase()}.`);
    toast.success(`${singular} deleted.`);
    load();
  }

  return (
    <>
      <AdminPageHeader title={plural} description={`Create and manage the ${plural.toLowerCase()} used to organise your shop.`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          {rows === null ? (
            <p className="p-6 text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No {plural.toLowerCase()} yet.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {r.name} {!r.active && <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hidden</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">/{r.slug} · {counts[r.id] ?? 0} products</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${r.name}`}
                    onClick={() =>
                      setForm({
                        id: r.id,
                        name: r.name,
                        slug: r.slug,
                        description: r.description ?? "",
                        active: r.active,
                        icon: r.icon ?? "",
                        sort_order: String(r.sort_order ?? 0),
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${r.name}`} onClick={() => remove(r)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={save} className="h-fit space-y-4 rounded-xl border border-black/10 bg-white p-5">
          <h2 className="font-semibold">{form.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}</h2>
          <div className="space-y-2">
            <Label htmlFor="tx-name">Name</Label>
            <Input id="tx-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-slug">Link name (optional)</Label>
            <Input id="tx-slug" value={form.slug} placeholder={slugify(form.name)} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx-desc">Description</Label>
            <Textarea id="tx-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {isCat && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tx-icon">Icon</Label>
                <Input id="tx-icon" placeholder="laptop" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tx-sort">Order</Label>
                <Input id="tx-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>
          )}
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Visible in shop
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {form.id ? "Save changes" : `Add ${singular.toLowerCase()}`}
            </Button>
            {form.id && (
              <Button type="button" variant="outline" onClick={() => setForm(blank)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
