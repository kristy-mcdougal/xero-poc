import Link from "next/link";
import type { Branding, Region, SiteData } from "@/lib/types";
import { BRAND_FALLBACK, navbarTarget, navHref, regionHasPath, resolveCta, resolveNavbar } from "@/lib/resolve";
import { type EditTarget, fieldAttrs, into } from "@/lib/preview";
import { publicPath } from "@/lib/urls";

export function SiteHeader({
  site,
  region,
  path,
  page,
  post,
  branding,
  brandTarget,
}: {
  site: SiteData;
  region: Region;
  path: string;
  page?: Parameters<typeof resolveCta>[3];
  post?: Parameters<typeof resolveCta>[4];
  branding: Branding | null;
  brandTarget: EditTarget | null;
}) {
  const navbar = resolveNavbar(region, page);
  const navTarget = navbarTarget(region, page);
  const cta = resolveCta(site, region, path, page, post);
  const navBarColor = branding?.navBarColor?.hex || BRAND_FALLBACK.navBar;
  const buttonColor = branding?.primaryButtonColor?.hex || BRAND_FALLBACK.primaryButton;
  const logo = branding?.logo;

  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{ backgroundColor: navBarColor }}
      {...fieldAttrs(brandTarget, "navBarColor")}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-6">
          <Link href={publicPath(region.pathPrefix, "home")} className="flex items-center">
            {logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.url} alt="xero" className="h-7 w-auto" {...fieldAttrs(brandTarget, "logo")} />
            ) : (
              <span className="text-2xl font-extrabold">xero</span>
            )}
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm font-medium text-white/80">
            {navbar?.items.map((item) => (
              <Link
                key={item.id ?? item.label}
                href={navHref(region.pathPrefix, item)}
                className="hover:text-white"
                {...fieldAttrs(into(navTarget, "items", item.id), "label")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={cta.href}
            className="rounded-full px-4 py-2 text-xs font-semibold text-navy"
            style={{ backgroundColor: buttonColor }}
          >
            <span className="md:hidden" {...fieldAttrs(cta.editTarget, cta.mobileField)}>
              {cta.mobileLabel}
            </span>
            <span className="hidden md:inline" {...fieldAttrs(cta.editTarget, cta.desktopField)}>
              {cta.label}
            </span>
          </Link>
          <div className="flex gap-1">
            {site.regions.map((item) => {
              const href = regionHasPath(item, path)
                ? path.startsWith("blog/") && path !== "blog"
                  ? publicPath(item.pathPrefix, path)
                  : publicPath(item.pathPrefix, path)
                : publicPath(item.pathPrefix, "home");
              const active = item.pathPrefix === region.pathPrefix;
              return (
                <Link
                  key={item.name}
                  href={href}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                    active ? "bg-white text-navy" : "bg-white/10 text-white/70"
                  }`}
                >
                  {item.pathPrefix || "global"}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
