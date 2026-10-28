"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function PreviewToggle() {
  const pathname = usePathname();
  const params = useSearchParams();
  const isPreview = params.get("preview") === "1" || params.get("preview") === "true";

  const next = new URLSearchParams(Array.from(params.entries()));
  if (isPreview) next.delete("preview");
  else next.set("preview", "1");
  const qs = next.toString();
  const href = qs ? `${pathname}?${qs}` : pathname;

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={isPreview ? "Exit live preview" : "Enter live preview"}
      className={`fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1 transition ${
        isPreview
          ? "bg-xero text-navy ring-xero/40 hover:brightness-95"
          : "bg-navy text-white ring-white/10 hover:bg-navy/90"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isPreview ? "animate-pulse bg-navy" : "bg-xero"}`} />
      {isPreview ? "Exit live preview" : "Live preview"}
    </Link>
  );
}
