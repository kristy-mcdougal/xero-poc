import Link from "next/link";
import type { Branding, FooterPage, Region } from "@/lib/types";
import { BRAND_FALLBACK } from "@/lib/resolve";
import { type EditTarget, fieldAttrs, into, root } from "@/lib/preview";
import { publicPath } from "@/lib/urls";

export function SiteFooter({
  region,
  branding,
  brandTarget,
}: {
  region: Region;
  branding: Branding | null;
  brandTarget: EditTarget | null;
}) {
  const footer = region.footer;
  const footerTarget = into(root(region.id), "footer", footer?.id);
  const navBarColor = branding?.navBarColor?.hex || BRAND_FALLBACK.navBar;
  const logo = branding?.logo;
  return (
    <footer className="mt-auto text-white" style={{ backgroundColor: navBarColor }} {...fieldAttrs(brandTarget, "navBarColor")}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {logo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.url} alt="xero" className="h-7 w-auto" {...fieldAttrs(brandTarget, "logo")} />
        ) : (
          <p className="text-2xl font-extrabold">xero</p>
        )}
        <FooterCol
          title={footer?.column1Title || "Product"}
          titleField="column1Title"
          target={footerTarget}
          pages={footer?.column1Pages || []}
          prefix={region.pathPrefix}
        />
        <FooterCol
          title={footer?.column2Title || "Company"}
          titleField="column2Title"
          target={footerTarget}
          pages={footer?.column2Pages || []}
          prefix={region.pathPrefix}
        />
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  titleField,
  target,
  pages,
  prefix,
}: {
  title: string;
  titleField: string;
  target: EditTarget | null;
  pages: FooterPage[];
  prefix: string;
}) {
  return (
    <div>
      <h2
        className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50"
        {...fieldAttrs(target, titleField)}
      >
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-white/75">
        {pages.map((page) => (
          <li key={page.path}>
            {/* Label is the linked page's SEO title, edited on that page's Seo component. */}
            <Link href={publicPath(prefix, page.path)} {...fieldAttrs(into(root(page.id), "seo", page.seo?.id), "title")}>
              {page.seo?.title || page.path}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
