export type Cta = {
  id?: string;
  label: string;
  href?: string | null;
  page?: { path: string } | null;
  blogPost?: { slug: string } | null;
};

export type Discount = {
  id?: string;
  discountPercentage: number;
  discountDurationInMonths: number;
  promoCopy: {
    id?: string;
    bannerTemplate: string | null;
    planPriceTemplate: string | null;
    disclaimerText?: string | null;
  } | null;
};

export type Navbar = {
  id?: string;
  internalTitle: string;
  items: NavItem[];
  ctaOverride: Cta | null;
};

export type Plan = {
  id?: string;
  title: string;
  description: string | null;
  baseMonthlyPrice: number | null;
};

export type BasicTextBlock = {
  __typename: "BasicTextBlock";
  id?: string;
  headline: string | null;
  body: string | null;
};

export type PlanBlock = {
  __typename: "PlanBlock";
  id?: string;
  planColumns: "TWO" | "THREE" | "FOUR" | null;
  disclaimer: string | null;
  plans: Plan[];
};

export type BlogPostListBlock = {
  __typename: "BlogPostList";
  id?: string;
  heading: string | null;
};

export type FeatureStatus = "INCLUDED" | "PARTIAL" | "NOT_INCLUDED" | "ADD_ON";

export type FeatureSupport = {
  id?: string;
  supportStatus: FeatureStatus | null;
  note: string | null;
  product: { id: string; name: string } | null;
  plans: { id?: string; name: string }[];
};

export type Feature = {
  id: string;
  name: string;
  description: string | null;
  support: FeatureSupport[];
};

export type FeatureGroup = {
  id?: string;
  name: string;
  features: Feature[];
};

export type ComparisonTable = {
  id?: string;
  title: string;
  note: string | null;
  products: { id: string; name: string; isPrimary: boolean | null }[];
  featureGroups: FeatureGroup[];
};

export type ComparisonBlock = {
  __typename: "ComparisonBlock";
  id?: string;
  heading: string | null;
  comparisonTable: ComparisonTable | null;
};

export type HighlightItem = {
  id?: string;
  title: string;
  description: string | null;
};

export type HighlightsBlock = {
  __typename: "HighlightsBlock";
  id?: string;
  heading: string | null;
  subheading: string | null;
  items: HighlightItem[];
};

export type PageBlock =
  | BasicTextBlock
  | PlanBlock
  | BlogPostListBlock
  | ComparisonBlock
  | HighlightsBlock;

export type Segment = { id?: string; name: string };

export type PageVariant = {
  id: string;
  segments: Segment[];
  blocks: PageBlock[];
};

export type PageVariantsData = {
  page: {
    id: string;
    path: string;
    variants: PageVariant[];
  } | null;
};

export type PageSettings = {
  id?: string;
  navbar: Navbar | null;
  promotionalDiscount: Discount | null;
  ctaOverrides: RegionalCta[];
};

export type Page = {
  id?: string;
  slug: string;
  path: string;
  seo: { id?: string; title: string; description: string | null } | null;
  settings: PageSettings | null;
  variants: { id: string; segments: Segment[] }[];
  blocks: PageBlock[];
};

export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  body: { html: string } | null;
  localizations: { locale: string; title: string; body: { html: string } | null }[];
  promotionalDiscount: Discount | null;
  ctaOverrides: RegionalCta[];
};

export type NavItem = {
  id?: string;
  label: string;
  page: { path: string } | null;
  blogPost: { slug: string } | null;
};

export type RegionalCta = Cta & {
  region: { pathPrefix: string } | null;
};

export type Region = {
  id?: string;
  name: string;
  pathPrefix: string;
  contentLocale: string | null;
  navbar: Navbar | null;
  footer: {
    id?: string;
    column1Title: string | null;
    column2Title: string | null;
    column1Pages: FooterPage[];
    column2Pages: FooterPage[];
  } | null;
  promotionalDiscount: Discount | null;
  homePage: Page | null;
  pages: Page[];
  blogPosts: BlogPost[];
};

export type FooterPage = { id?: string; path: string; seo: { id?: string; title: string } | null };

export type CtaRule = {
  id?: string;
  pathPattern: string;
  priority: number | null;
  regions: { pathPrefix: string }[];
  cta: Cta | null;
};

export type Branding = {
  id?: string;
  navBarColor: { hex: string } | null;
  bannerColor: { hex: string } | null;
  primaryButtonColor: { hex: string } | null;
  logo: { id?: string; url: string; width: number | null; height: number | null } | null;
};

export type SiteSettings = {
  id?: string;
  defaultCtaDesktop: string | null;
  defaultCtaMobile: string | null;
  branding: Branding | null;
};

export type SiteData = {
  siteSettingses: SiteSettings[];
  ctaRules: CtaRule[];
  regions: Region[];
};
