import type { Branding, BlogPost, Cta, Discount, Page, Region, SiteData } from "./types";
import { blogPath, matchPattern, pathnameForMatch, publicPath } from "./urls";
import { discountedPrice, interpolate, money } from "./interpolate";
import { type EditTarget, into, root } from "./preview";

/** Fallback brand colors, used when Site Settings branding is empty. */
export const BRAND_FALLBACK = {
  navBar: "#0b2239",
  banner: "#e8f7fc",
  primaryButton: "#13b5ea",
} as const;

export function getBranding(site: SiteData): Branding | null {
  return site.siteSettingses[0]?.branding ?? null;
}

/** Click-to-edit target for the Branding component on Site Settings. */
export function brandingTarget(site: SiteData): EditTarget | null {
  const settings = site.siteSettingses[0];
  return into(root(settings?.id), "branding", settings?.branding?.id);
}

export function findRegion(regions: Region[], prefix: string) {
  return regions.find((region) => region.pathPrefix === prefix) ?? null;
}

export function findPage(region: Region, path: string) {
  if (path === "home") return region.homePage ?? region.pages.find((page) => page.path === "home") ?? null;
  return region.pages.find((page) => page.path === path) ?? null;
}

export function findPost(region: Region, path: string) {
  if (!path.startsWith("blog/") || path === "blog") return null;
  const slug = path.slice("blog/".length);
  return region.blogPosts.find((post) => post.slug === slug) ?? null;
}

export function localizedPost(post: BlogPost, locale: string) {
  const match = post.localizations.find((item) => item.locale === locale);
  if (!match) return post;
  return { ...post, title: match.title, body: match.body ?? post.body };
}

export function resolveDiscount(region: Region, page?: Page | null, post?: BlogPost | null): Discount | null {
  return resolveDiscountSource(region, page, post).discount;
}

/** Resolve the active discount together with the edit target of its parent document/component. */
export function resolveDiscountSource(
  region: Region,
  page?: Page | null,
  post?: BlogPost | null
): { discount: Discount | null; parent: EditTarget | null } {
  if (post?.promotionalDiscount) {
    return { discount: post.promotionalDiscount, parent: root(post.id) };
  }
  if (page?.settings?.promotionalDiscount) {
    return {
      discount: page.settings.promotionalDiscount,
      parent: into(root(page.id), "settings", page.settings.id),
    };
  }
  if (region.promotionalDiscount) {
    return { discount: region.promotionalDiscount, parent: root(region.id) };
  }
  return { discount: null, parent: null };
}

/**
 * Edit target for the banner/price/disclaimer templates.
 * PromoCopy is a standalone model (referenced via PromotionalDiscount), so the
 * click-to-edit root is the PromoCopy document itself — no component chain.
 */
export function promoCopyTarget(discount: Discount | null): EditTarget | null {
  return root(discount?.promoCopy?.id);
}

export function resolveNavbar(region: Region, page?: Page | null) {
  return page?.settings?.navbar ?? region.navbar;
}

/**
 * Edit target for the active navbar (page settings override or region default).
 * Navbar is a standalone model, so the root is the Navbar document itself.
 */
export function navbarTarget(region: Region, page?: Page | null): EditTarget | null {
  return root(resolveNavbar(region, page)?.id);
}

export function ctaHref(prefix: string, cta?: Cta | null) {
  if (cta?.page) return publicPath(prefix, cta.page.path);
  if (cta?.blogPost) return blogPath(prefix, cta.blogPost.slug);
  return cta?.href || publicPath(prefix, "pricing");
}

export function navHref(prefix: string, item: { page: { path: string } | null; blogPost: { slug: string } | null }) {
  if (item.page) return publicPath(prefix, item.page.path);
  if (item.blogPost) return blogPath(prefix, item.blogPost.slug);
  return publicPath(prefix, "home");
}

export type ResolvedCta = {
  label: string;
  mobileLabel: string;
  href: string;
  source: "page" | "rule" | "navbar" | "site";
  /** Document + component chain that owns the CTA label(s), for click-to-edit. */
  editTarget: EditTarget | null;
  /** Field api id for the desktop label. */
  desktopField: string;
  /** Field api id for the mobile label (same as desktop unless it is a template pair). */
  mobileField: string;
};

export function resolveCta(
  site: SiteData,
  region: Region,
  path: string,
  page?: Page | null,
  post?: BlogPost | null
): ResolvedCta {
  const discount = resolveDiscount(region, page, post);
  const settings = site.siteSettingses[0];
  const navbar = resolveNavbar(region, page);

  const overrides = [
    ...(page?.settings?.ctaOverrides ?? []).map((cta) => ({
      cta,
      parent: into(root(page?.id), "settings", page?.settings?.id),
    })),
    ...(post?.ctaOverrides ?? []).map((cta) => ({ cta, parent: root(post?.id) })),
  ];
  const regional = overrides.find((item) => item.cta.region?.pathPrefix === region.pathPrefix);
  const unscoped = overrides.find((item) => !item.cta.region);
  const pageCta = regional ?? unscoped;
  if (pageCta?.cta.label) {
    return {
      label: pageCta.cta.label,
      mobileLabel: pageCta.cta.label,
      href: ctaHref(region.pathPrefix, pageCta.cta),
      source: "page",
      editTarget: into(pageCta.parent, "ctaOverrides", pageCta.cta.id),
      desktopField: "label",
      mobileField: "label",
    };
  }

  const pathname = pathnameForMatch(path);
  const rules = [...site.ctaRules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const rule = rules.find((item) => {
    const scoped = item.regions.length === 0 || item.regions.some((entry) => entry.pathPrefix === region.pathPrefix);
    return scoped && matchPattern(item.pathPattern, pathname);
  });
  if (rule?.cta?.label) {
    return {
      label: rule.cta.label,
      mobileLabel: rule.cta.label,
      href: ctaHref(region.pathPrefix, rule.cta),
      source: "rule",
      editTarget: into(root(rule.id), "cta", rule.cta.id),
      desktopField: "label",
      mobileField: "label",
    };
  }

  if (navbar?.ctaOverride?.label) {
    return {
      label: navbar.ctaOverride.label,
      mobileLabel: navbar.ctaOverride.label,
      href: ctaHref(region.pathPrefix, navbar.ctaOverride),
      source: "navbar",
      editTarget: into(navbarTarget(region, page), "ctaOverride", navbar.ctaOverride.id),
      desktopField: "label",
      mobileField: "label",
    };
  }

  const values = {
    percentage: discount?.discountPercentage ?? 0,
    duration: discount?.discountDurationInMonths ?? 0,
  };
  const desktop = interpolate(settings?.defaultCtaDesktop || "Get {percentage}% off for {duration} months", values);
  const mobile = interpolate(settings?.defaultCtaMobile || "Get {percentage}% off", values);
  return {
    label: desktop,
    mobileLabel: mobile,
    href: publicPath(region.pathPrefix, "pricing"),
    source: "site",
    editTarget: root(settings?.id),
    desktopField: "defaultCtaDesktop",
    mobileField: "defaultCtaMobile",
  };
}

export function bannerText(discount: Discount | null) {
  if (!discount?.promoCopy?.bannerTemplate) return "";
  return interpolate(discount.promoCopy.bannerTemplate, {
    percentage: discount.discountPercentage,
    duration: discount.discountDurationInMonths,
  });
}

export function planPriceText(discount: Discount | null, base: number) {
  const template =
    discount?.promoCopy?.planPriceTemplate ||
    "{discounted} per month for the first {duration} months, then {base} per month until cancelled";
  const percentage = discount?.discountPercentage ?? 0;
  return interpolate(template, {
    percentage,
    duration: discount?.discountDurationInMonths ?? 0,
    base: money(base),
    discounted: money(discountedPrice(base, percentage)),
  });
}

export function interpolateText(text: string | null | undefined, discount: Discount | null) {
  if (!text) return "";
  return interpolate(text, {
    percentage: discount?.discountPercentage ?? 0,
    duration: discount?.discountDurationInMonths ?? 0,
  });
}

export function regionHasPath(region: Region, path: string) {
  if (path.startsWith("blog/") && path !== "blog") return Boolean(findPost(region, path));
  return Boolean(findPage(region, path));
}
