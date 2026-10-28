import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DemoBar } from "@/components/DemoBar";
import { PageBlocks } from "@/components/PageBlocks";
import { PromoBanner } from "@/components/PromoBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hygraphFetch } from "@/lib/hygraph";
import { GET_SITE } from "@/lib/queries";
import {
  brandingTarget,
  findPage,
  findPost,
  findRegion,
  getBranding,
  localizedPost,
  promoCopyTarget,
  resolveCta,
  resolveDiscountSource,
} from "@/lib/resolve";
import { fieldAttrs, root } from "@/lib/preview";
import type { SiteData } from "@/lib/types";
import { parsePath, publicPath } from "@/lib/urls";

type Search = { [key: string]: string | string[] | undefined };

function isPreview(searchParams?: Search) {
  return searchParams?.preview === "true" || searchParams?.preview === "1";
}

async function loadSite(searchParams?: Search) {
  const stage = isPreview(searchParams) ? "DRAFT" : "PUBLISHED";
  return hygraphFetch<SiteData>(GET_SITE, { stage });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { segments?: string[] };
  searchParams?: Search;
}): Promise<Metadata> {
  const parsed = parsePath(params.segments);
  if (parsed.kind === "docs") return { title: "How resolution works" };
  const site = await loadSite(searchParams);
  const region = findRegion(site.regions, parsed.prefix);
  const page = region ? findPage(region, parsed.path) : null;
  const post = region ? findPost(region, parsed.path) : null;
  return { title: post?.title || page?.seo?.title || "Xero POC" };
}

export default async function CatchAllPage({
  params,
  searchParams,
}: {
  params: { segments?: string[] };
  searchParams?: Search;
}) {
  const parsed = parsePath(params.segments);
  const site = await loadSite(searchParams);

  if (parsed.kind === "docs") {
    return <DocsPage />;
  }

  const region = findRegion(site.regions, parsed.prefix);
  if (!region) notFound();

  const page = findPage(region, parsed.path);
  const rawPost = findPost(region, parsed.path);
  if (!page && !rawPost) notFound();

  const localeParam = typeof searchParams?.locale === "string" ? searchParams.locale : undefined;
  const locale = localeParam || region.contentLocale || "en";

  const post = rawPost ? localizedPost(rawPost, locale) : null;
  const { discount } = resolveDiscountSource(region, page, rawPost);
  const copyTarget = promoCopyTarget(discount);
  const cta = resolveCta(site, region, parsed.path, page, rawPost);
  const publicUrl = publicPath(region.pathPrefix, parsed.path);
  const branding = getBranding(site);
  const brandTarget = brandingTarget(site);

  return (
    <>
      <SiteHeader
        site={site}
        region={region}
        path={parsed.path}
        page={page}
        post={rawPost}
        branding={branding}
        brandTarget={brandTarget}
      />
      <PromoBanner discount={discount} editTarget={copyTarget} branding={branding} brandTarget={brandTarget} />
      <DemoBar
        items={[
          { label: "Public URL", value: publicUrl },
          { label: "Region / locale", value: `${region.pathPrefix || "global"} · ${locale}` },
          { label: "Discount", value: discount ? `${discount.discountPercentage}% / ${discount.discountDurationInMonths} mo` : "none" },
          { label: "CTA source", value: `${cta.source}: ${cta.label}` },
          { label: "Stage", value: isPreview(searchParams) ? "DRAFT (preview)" : "PUBLISHED" },
        ]}
      />
      <main className="flex-1">
        {post ? (
          <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h1 className="text-4xl font-extrabold" {...fieldAttrs(root(rawPost?.id), "title")}>
              {post.title}
            </h1>
            <div
              className="rich-text mt-6"
              {...fieldAttrs(root(rawPost?.id), "body", { richText: "html" })}
              dangerouslySetInnerHTML={{ __html: post.body?.html || "" }}
            />
          </article>
        ) : (
          <PageBlocks
            blocks={page?.blocks ?? []}
            pageId={page?.id}
            region={region}
            locale={locale}
            discount={discount}
            copyTarget={copyTarget}
          />
        )}
      </main>
      <SiteFooter region={region} branding={branding} brandTarget={brandTarget} />
    </>
  );
}

function DocsPage() {
  return (
    <main className="min-h-screen bg-navy px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-white/60">
          ← Global home
        </Link>
        <h1 className="mt-6 text-4xl font-extrabold">How resolution works</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-white/75">
          <li>URL splits into region prefix (empty, au, nz, uk) and path.</li>
          <li>Page or blog post must be assigned to that region or it 404s.</li>
          <li>Page layout is the ordered Blocks list. Add or reorder Basic Text Block, Plans, or Blog Post List in the CMS.</li>
          <li>Navbar, discount override, and one-off CTAs live on Page Settings, not in the layout.</li>
          <li>CTA: page/post override → matching CtaRule → navbar CTA → Site Settings.</li>
          <li>Add <code>?preview=1</code> to serve DRAFT content and enable click-to-edit; add <code>&amp;locale=en_GB</code> to preview a locale.</li>
        </ol>
      </div>
    </main>
  );
}
