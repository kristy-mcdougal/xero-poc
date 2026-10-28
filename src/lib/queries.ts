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
  }
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
