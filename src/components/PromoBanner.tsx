import type { Branding, Discount } from "@/lib/types";
import { BRAND_FALLBACK, bannerText } from "@/lib/resolve";
import { type EditTarget, fieldAttrs } from "@/lib/preview";

export function PromoBanner({
  discount,
  editTarget,
  branding,
  brandTarget,
}: {
  discount: Discount | null;
  editTarget: EditTarget | null;
  branding: Branding | null;
  brandTarget: EditTarget | null;
}) {
  const text = bannerText(discount);
  if (!text) return null;
  const bannerColor = branding?.bannerColor?.hex || BRAND_FALLBACK.banner;
  return (
    <section
      className="px-4 py-10 text-center"
      style={{ backgroundColor: bannerColor }}
      {...fieldAttrs(brandTarget, "bannerColor")}
    >
      <p
        className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-navy sm:text-4xl"
        {...fieldAttrs(editTarget, "bannerTemplate")}
      >
        {text}
      </p>
    </section>
  );
}
