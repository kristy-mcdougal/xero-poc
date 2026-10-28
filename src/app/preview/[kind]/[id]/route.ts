import { NextResponse } from "next/server";
import { hygraphFetch } from "@/lib/hygraph";
import { GET_SITE } from "@/lib/queries";
import type { SiteData } from "@/lib/types";
import { blogPath, publicPath } from "@/lib/urls";

/**
 * Single-entry preview resolver.
 *
 * Studio only knows the entry id, not which regional URL to open (region is a
 * reverse relation and shared entries belong to several regions). This route
 * looks the id up across regions, prefers Global, falls back to whichever
 * region actually has it, then redirects to that regional path in preview mode.
 *
 *   /preview/page/{id}            -> /{region}/{path}?preview=1
 *   /preview/post/{id}?locale=... -> /{region}/blog/{slug}?preview=1&locale=...
 */
export async function GET(
  request: Request,
  { params }: { params: { kind: string; id: string } }
) {
  const { kind, id } = params;
  const locale = new URL(request.url).searchParams.get("locale") || undefined;

  const site = await hygraphFetch<SiteData>(GET_SITE, { stage: "DRAFT" });
  // Global (empty prefix) first, so shared entries resolve to the clean URL.
  const regions = [...site.regions].sort((a, b) => a.pathPrefix.length - b.pathPrefix.length);

  let target: string | null = null;

  for (const region of regions) {
    if (kind === "post") {
      const post = region.blogPosts.find((p) => p.id === id);
      if (post) {
        target = blogPath(region.pathPrefix, post.slug);
        break;
      }
    } else {
      const page =
        (region.homePage?.id === id ? region.homePage : null) ??
        region.pages.find((p) => p.id === id);
      if (page) {
        target = publicPath(region.pathPrefix, page.path);
        break;
      }
    }
  }

  const base = new URL(request.url);
  if (!target) {
    // Entry not assigned to any region yet — fall back to Global home.
    return NextResponse.redirect(new URL("/?preview=1", base), 307);
  }

  const qs = new URLSearchParams({ preview: "1" });
  if (locale) qs.set("locale", locale);
  return NextResponse.redirect(new URL(`${target}?${qs.toString()}`, base), 307);
}
