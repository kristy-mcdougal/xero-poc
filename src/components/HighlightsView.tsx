import { chainAttrs, fieldAttrs, into } from "@/lib/preview";
import type { HighlightsBlock } from "@/lib/types";
import type { EditTarget } from "@/lib/preview";

/**
 * "Software that works for you" style section: heading, subheading, and a row
 * of value props, each with a fixed blue tick, a bold title, and a description.
 *
 * Click-to-edit is rooted at the owning entry; each item carries its component
 * chain so the icon cards can also be reordered live in preview.
 */
export function HighlightsView({
  block,
  blockTarget,
}: {
  block: HighlightsBlock;
  blockTarget: EditTarget | null;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {block.heading && (
        <h2 className="text-3xl font-extrabold text-navy" {...fieldAttrs(blockTarget, "heading")}>
          {block.heading}
        </h2>
      )}
      {block.subheading && (
        <p className="mt-3 max-w-2xl text-lg text-black/70" {...fieldAttrs(blockTarget, "subheading")}>
          {block.subheading}
        </p>
      )}

      <div
        className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        {...fieldAttrs(blockTarget, "items")}
      >
        {block.items?.map((item) => {
          const itemTarget = into(blockTarget, "items", item.id);
          return (
            <div key={item.id} {...chainAttrs(itemTarget)}>
              <div className="flex items-start gap-3">
                <CheckSquare />
                <h3 className="pt-1 font-bold text-navy" {...fieldAttrs(itemTarget, "title")}>
                  {item.title}
                </h3>
              </div>
              {item.description && (
                <p
                  className="mt-3 whitespace-pre-line leading-relaxed text-black/70"
                  {...fieldAttrs(itemTarget, "description")}
                >
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Fixed blue rounded-square tick, matching the live site's value-prop icon. */
function CheckSquare() {
  return (
    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-[#2355e6] text-white">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
