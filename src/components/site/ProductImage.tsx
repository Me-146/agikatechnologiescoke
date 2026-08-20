import {
  Laptop,
  Mouse,
  Printer,
  Router,
  Cctv,
  Gamepad2,
  ScanLine,
  Apple,
  AppWindow,
  type LucideIcon,
} from "lucide-react";
import type { CategorySlug } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const icons: Record<CategorySlug, LucideIcon> = {
  computers: Laptop,
  accessories: Mouse,
  "printers-scanners": Printer,
  networking: Router,
  "cctv-security": Cctv,
  gaming: Gamepad2,
  "pos-systems": ScanLine,
  apple: Apple,
  software: AppWindow,
};

export function CategoryIcon({ category, className }: { category: CategorySlug; className?: string }) {
  const Icon = icons[category] ?? Laptop;
  return <Icon className={className} aria-hidden="true" />;
}

export function ProductImage({
  category,
  name,
  className,
  iconClassName,
}: {
  category: CategorySlug;
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = icons[category] ?? Laptop;
  return (
    <div
      role="img"
      aria-label={`${name} — AGIKA Technologies product image`}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-secondary",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(120%_120%_at_20%_0%,color-mix(in_oklab,var(--brand)_22%,transparent),transparent_60%),radial-gradient(120%_120%_at_100%_100%,color-mix(in_oklab,var(--brand-purple)_22%,transparent),transparent_60%)]" />
      <Icon className={cn("relative h-14 w-14 text-brand", iconClassName)} strokeWidth={1.25} aria-hidden="true" />
    </div>
  );
}
