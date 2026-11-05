import Link from "next/link";
import { PlanCards } from "@/components/PlanCards";
import { interpolateText, localizedPost } from "@/lib/resolve";
import { chainAttrs, type EditTarget, fieldAttrs, into, root } from "@/lib/preview";
import type { Discount, PageBlock, Region } from "@/lib/types";
import { blogPath } from "@/lib/urls";

/**
 * Renders the ordered `blocks` list for a Page or a PageVariant.
 *
 * `blocksEntryId` is the id of the entry that OWNS the blocks (the Page or the
 * variant). Click-to-edit for every field is rooted at that id, so the same
 * component works for both pages and variants.
 *
 * The outer <div> is tagged as the `blocks` array field and each block sits in
 * a direct-child wrapper tagged with its component chain. That is exactly what
 * the preview SDK needs to reorder components live in the array container.
 */
export function PageBlocks({
  blocks,
  blocksEntryId,
  region,
  locale,
  discount,
  copyTarget,
}: {
  blocks: PageBlock[];
  blocksEntryId?: string;
  region: Region;
  locale: string;
  discount: Discount | null;
  copyTarget: EditTarget | null;
}) {
  return (
    <div {...fieldAttrs(root(blocksEntryId), "blocks")}>
      {blocks.map((block, index) => {
        // Each block is a component instance inside the entry's `blocks` field.
        const blockTarget = into(root(blocksEntryId), "blocks", block.id);
        return (
          <div key={block.id ?? index} {...chainAttrs(blockTarget)}>
            {block.__typename === "BasicTextBlock" && (
              <BasicText block={block} target={blockTarget} discount={discount} />
            )}
            {block.__typename === "PlanBlock" && (
              <>
                <PlanCards plans={block.plans} columns={block.planColumns} discount={discount} copyTarget={copyTarget} />
                {block.disclaimer && (
                  <section
                    className="mx-auto max-w-3xl whitespace-pre-line px-4 pb-16 text-sm text-black/60"
                    {...fieldAttrs(blockTarget, "disclaimer")}
                  >
                    {interpolateText(block.disclaimer, discount)}
                  </section>
                )}
              </>
            )}
            {block.__typename === "BlogPostList" && (
              <BlogList heading={block.heading} target={blockTarget} region={region} locale={locale} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BasicText({
  block,
  target,
  discount,
}: {
  block: Extract<PageBlock, { __typename: "BasicTextBlock" }>;
  target: EditTarget | null;
  discount: Discount | null;
}) {
  const body = interpolateText(block.body, discount);
  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {block.headline && (
        <h1 className="text-4xl font-extrabold" {...fieldAttrs(target, "headline")}>
          {block.headline}
        </h1>
      )}
      {body && (
        <p className="mt-6 whitespace-pre-line leading-relaxed" {...fieldAttrs(target, "body")}>
          {body}
        </p>
      )}
    </section>
  );
}

function BlogList({
  heading,
  target,
  region,
  locale,
}: {
  heading: string | null;
  target: EditTarget | null;
  region: Region;
  locale: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
      {heading && (
        <h2 className="mb-6 text-2xl font-bold" {...fieldAttrs(target, "heading")}>
          {heading}
        </h2>
      )}
      <ul className="space-y-3">
        {region.blogPosts.map((item) => {
          const loc = localizedPost(item, locale);
          return (
            <li key={item.slug}>
              <Link
                className="font-semibold text-xero"
                href={blogPath(region.pathPrefix, item.slug)}
                {...fieldAttrs(root(item.id), "title")}
              >
                {loc.title}
              </Link>
              <p className="font-mono text-xs text-black/40">{blogPath(region.pathPrefix, item.slug)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
