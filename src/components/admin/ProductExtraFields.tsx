import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductSpec } from "@/lib/store";

export type ProductExtras = {
  sku: string;
  category_id: string;
  brand_id: string;
  sale_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  specifications: ProductSpec[];
  published: boolean;
};

export const emptyExtras: ProductExtras = {
  sku: "",
  category_id: "",
  brand_id: "",
  sale_price: "",
  stock_quantity: "0",
  low_stock_threshold: "3",
  specifications: [],
  published: false,
};

const NONE = "none";

/** Validates extras and converts them to database column values. Returns an error string on failure. */
export function extrasToRow(x: ProductExtras, price: number) {
  const stock = Number(x.stock_quantity);
  const low = Number(x.low_stock_threshold);
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock quantity must be a whole number of 0 or more." };
  if (!Number.isInteger(low) || low < 0) return { error: "Low-stock threshold must be a whole number of 0 or more." };
  let sale: number | null = null;
  if (x.sale_price.trim()) {
    sale = Number(x.sale_price);
    if (!Number.isFinite(sale) || sale <= 0) return { error: "Sale price must be greater than zero." };
    if (sale >= price) return { error: "Sale price must be lower than the regular price." };
  }
  return {
    row: {
      sku: x.sku.trim() || null,
      category_id: x.category_id || null,
      brand_id: x.brand_id || null,
      sale_price: sale,
      stock_quantity: stock,
      low_stock_threshold: low,
      specifications: x.specifications
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
        .filter((s) => s.label && s.value),
      published: x.published,
    },
  };
}

type Option = { id: string; name: string };

export function ProductExtraFields({ value, onChange }: { value: ProductExtras; onChange: (v: ProductExtras) => void }) {
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("sort_order").then(({ data }) => setCategories(data ?? []));
    supabase.from("brands").select("id,name").order("name").then(({ data }) => setBrands(data ?? []));
  }, []);

  const set = <K extends keyof ProductExtras>(k: K, v: ProductExtras[K]) => onChange({ ...value, [k]: v });
  const specs = value.specifications;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={value.category_id || NONE} onValueChange={(v) => set("category_id", v === NONE ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No category</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={value.brand_id || NONE} onValueChange={(v) => set("brand_id", v === NONE ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Choose brand" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>No brand</SelectItem>
              {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={value.sku} onChange={(e) => set("sku", e.target.value)} placeholder="HP-840G7-I5" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_price">Sale price (optional, KSh)</Label>
          <Input id="sale_price" type="number" min="0" step="0.01" value={value.sale_price} onChange={(e) => set("sale_price", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Stock quantity</Label>
          <Input id="stock_quantity" type="number" min="0" step="1" required value={value.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="low_stock">Low-stock alert at</Label>
          <Input id="low_stock" type="number" min="0" step="1" required value={value.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Specifications</Label>
        {specs.map((s, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="e.g. Processor" value={s.label} onChange={(e) => set("specifications", specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <Input placeholder="e.g. Intel Core i5 10th Gen" value={s.value} onChange={(e) => set("specifications", specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
            <Button type="button" variant="ghost" size="icon" aria-label="Remove specification" onClick={() => set("specifications", specs.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => set("specifications", [...specs, { label: "", value: "" }])}>
          <Plus className="h-4 w-4" /> Add specification
        </Button>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <Switch checked={value.published} onCheckedChange={(v) => set("published", v)} />
        Published (visible to customers)
      </label>
    </div>
  );
}
