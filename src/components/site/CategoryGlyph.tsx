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
  Sparkles,
  Wrench,
  Package,
  type LucideIcon,
} from "lucide-react";

const glyphs: Record<string, LucideIcon> = {
  laptop: Laptop,
  mouse: Mouse,
  printer: Printer,
  router: Router,
  cctv: Cctv,
  "gamepad-2": Gamepad2,
  "scan-line": ScanLine,
  apple: Apple,
  "app-window": AppWindow,
  sparkles: Sparkles,
  wrench: Wrench,
};

/** Renders the icon stored on a database category, with a safe fallback. */
export function CategoryGlyph({ icon, className }: { icon: string | null; className?: string }) {
  const Icon = (icon && glyphs[icon]) || Package;
  return <Icon className={className} aria-hidden="true" />;
}
