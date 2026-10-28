import type { Discount, Plan, PlanBlock } from "@/lib/types";
import { planPriceText } from "@/lib/resolve";
import { money } from "@/lib/interpolate";
import { type EditTarget, fieldAttrs, root } from "@/lib/preview";

const COLUMN_CLASS = {
  TWO: "sm:grid-cols-2",
  THREE: "sm:grid-cols-3",
  FOUR: "sm:grid-cols-4",
} as const;

export function PlanCards({
  plans,
  columns,
  discount,
  copyTarget,
}: {
  plans: Plan[];
  columns?: PlanBlock["planColumns"];
  discount: Discount | null;
  copyTarget: EditTarget | null;
}) {
  if (!plans.length) return null;
  const grid = COLUMN_CLASS[columns ?? "THREE"] ?? COLUMN_CLASS.THREE;
  return (
    <section className={`mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 ${grid}`}>
      {plans.map((plan) => {
        // Each plan is its own Plan document (relation), edited at its own root.
        const target = root(plan.id);
        return (
          <article key={plan.id ?? plan.title} className="rounded-2xl border border-black/5 p-6 shadow-sm">
            <h2 className="text-xl font-bold" {...fieldAttrs(target, "title")}>
              {plan.title}
            </h2>
            {plan.description && (
              <p className="mt-2 text-sm text-black/60" {...fieldAttrs(target, "description")}>
                {plan.description}
              </p>
            )}
            {plan.baseMonthlyPrice != null && (
              <>
                <p className="mt-6 text-3xl font-extrabold" {...fieldAttrs(target, "baseMonthlyPrice")}>
                  {money(plan.baseMonthlyPrice)}
                </p>
                {/* Price sentence is interpolated from the promo copy template. */}
                <p className="mt-2 text-sm leading-relaxed text-black/65" {...fieldAttrs(copyTarget, "planPriceTemplate")}>
                  {planPriceText(discount, plan.baseMonthlyPrice)}
                </p>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}
