import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

/** Product photo with a branded fallback — never renders a broken image icon. */
export function StoreProductImage({
  src,
  name,
  className,
  iconClassName,
}: {
  src: string | null;
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden bg-secondary", className)}
      {...(showFallback ? { role: "img", "aria-label": `${name} — image coming soon` } : {})}
    >
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(120%_120%_at_20%_0%,color-mix(in_oklab,var(--brand)_22%,transparent),transparent_60%),radial-gradient(120%_120%_at_100%_100%,color-mix(in_oklab,var(--brand-purple)_22%,transparent),transparent_60%)]" />
      {showFallback ? (
        <PackageSearch
          className={cn("relative h-14 w-14 text-brand", iconClassName)}
          strokeWidth={1.25}
          aria-hidden="true"
        />
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="relative h-full w-full object-cover"
        />
      )}
    </div>
  );
}
