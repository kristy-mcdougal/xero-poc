const DISCOUNT = `
  id
  discountPercentage
  discountDurationInMonths
  promoCopy {
    id
    bannerTemplate
    planPriceTemplate
    disclaimerText
  }
`;

const CTA = `
  id
  label
  href
  page { path }
  blogPost { slug }
`;

const NAVBAR = `
  id
  internalTitle
  ctaOverride { ${CTA} }
  items { id label page { path } blogPost { slug } }
`;

const COMPARISON_TABLE = `
  id
  title
  note
  products(first: 20) { id name isPrimary }
  featureGroups(first: 20) {
    id
    name
    features(first: 100) {
      id
      name
      description
      support(first: 10) {
        id
        supportStatus
        note
        product { id name }
        plans(first: 20) { id name }
      }
    }
  }
`;

const BLOCKS = `
  blocks {
    __typename
    ... on BasicTextBlock { id headline body }
    ... on PlanBlock {
      id
      planColumns
      disclaimer
      plans { id title description baseMonthlyPrice }
    }
    ... on BlogPostList { id heading }
    ... on ComparisonBlock { id heading comparisonTable { ${COMPARISON_TABLE} } }
    ... on HighlightsBlock { id heading subheading items { id title description } }
  }
`;

const PAGE = `
  id
  slug
  path
  seo { id title description }
  settings {
    id
    navbar { ${NAVBAR} }
    promotionalDiscount { ${DISCOUNT} }
    ctaOverrides {
      id
      label
      href
      region { pathPrefix }
      page { path }
      blogPost { slug }
    }
  }
  variants { id segments { id name } }
  ${BLOCKS}
`;

export const GET_SITE = `
  query GetSite($stage: Stage!) {
    siteSettingses(stage: $stage) {
      id
      defaultCtaDesktop
      defaultCtaMobile
      branding {
        id
        navBarColor { hex }
        bannerColor { hex }
        primaryButtonColor { hex }
        logo { id url width height }
      }
    }
    ctaRules(stage: $stage) {
      id
      pathPattern
      priority
      regions { pathPrefix }
      cta { ${CTA} }
    }
    regions(stage: $stage) {
      id
      name
      pathPrefix
      contentLocale
      navbar { ${NAVBAR} }
      footer {
        id
        column1Title
        column2Title
        column1Pages { id path seo { id title } }
        column2Pages { id path seo { id title } }
      }
      promotionalDiscount { ${DISCOUNT} }
      homePage { ${PAGE} }
      pages { ${PAGE} }
      blogPosts {
        id
        slug
        title
        body { html }
        localizations(includeCurrent: true) { locale title body { html } }
        ctaOverrides {
          id
          label
          href
          region { pathPrefix }
          page { path }
          blogPost { slug }
        }
      }
    }
  }
`;

/**
 * Variants are not root-queryable in the Content API; they are reached through
 * the parent page's `variants` reverse field. This fetches one page's variants
 * (with full block data) so a specific variant can be rendered in preview.
 */
export const GET_PAGE_VARIANTS = `
  query GetPageVariants($stage: Stage!, $id: ID!) {
    page(stage: $stage, where: { id: $id }) {
      id
      path
      variants {
        id
        segments { id name }
        ${BLOCKS}
      }
    }
  }
`;
