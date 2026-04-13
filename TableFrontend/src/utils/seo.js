/**
 * SEO Utilities for Dynamic Meta Tags and Structured Data
 * This module provides utilities to dynamically update meta tags for better SEO
 */

const SITE_NAME = "restroMenu";
const SITE_URL = "https://restromenu.com";
const SITE_LOGO = `${SITE_URL}/logo.png`;

/**
 * Update meta tag content
 */
export const updateMetaTag = (name, content, property = null) => {
  let element = document.querySelector(
    property ? `meta[property="${property}"]` : `meta[name="${name}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    if (property) {
      element.setAttribute("property", property);
    } else {
      element.setAttribute("name", name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

/**
 * Update page title and meta description
 */
export const updatePageMeta = (title, description, keywords = null) => {
  document.title = `${title} | ${SITE_NAME}`;
  updateMetaTag("description", description);
  if (keywords) {
    updateMetaTag("keywords", keywords);
  }

  // Update Open Graph
  updateMetaTag("title", title, "og:title");
  updateMetaTag("description", description, "og:description");

  // Update Twitter
  updateMetaTag("title", title, "twitter:title");
  updateMetaTag("description", description, "twitter:description");
};

/**
 * Update Open Graph image
 */
export const updateOGImage = (imageUrl) => {
  updateMetaTag("image", imageUrl, "og:image");
  updateMetaTag("image", imageUrl, "twitter:image");
};

/**
 * Update canonical URL
 */
export const updateCanonicalURL = (url) => {
  let canonicalLink = document.querySelector("link[rel='canonical']");
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = url;

  // Also update og:url
  updateMetaTag("url", url, "og:url");
};

/**
 * Add JSON-LD Structured Data
 */
export const addStructuredData = (data) => {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Page-specific SEO configurations
 */
export const pageMetaConfig = {
  landing: {
    title: "Digital QR Menus for Restaurants & Hotels",
    description:
      "restroMenu: Enable contactless table ordering, integrated POS billing, and seamless guest experience with QR code menus. Trusted by 12,000+ restaurants & hotels in India. Free setup in 5 minutes.",
    keywords:
      "QR code menu, digital menu, restaurant ordering system, table ordering system, POS system, hotel room service, contactless menu, digital restaurant technology, QR menu software, digital ordering system",
  },
  features: {
    title: "Features & Benefits",
    description:
      "Discover how restroMenu transforms the dining experience with QR code menus, table ordering, POS integration, analytics, and hotel room service.",
    keywords:
      "restaurant features, QR menu features, table ordering features, POS features, hotel room service features",
  },
  howItWorks: {
    title: "How It Works",
    description:
      "See how restroMenu works in 5 simple steps. From menu creation to order delivery—seamless restaurant operations.",
    keywords: "how QR menu works, table ordering process, POS workflow",
  },
  pricing: {
    title: "Simple, Honest Pricing",
    description:
      "Choose the right plan for your restaurant or hotel. Free plan forever, no credit card required. Scale as you grow.",
    keywords:
      "restaurant software pricing, QR menu pricing, POS pricing, affordable restaurant software",
  },
  demo: {
    title: "Live Demo",
    description:
      "Experience the restroMenu guest interface firsthand. Scan the QR code or click to try the interactive demo now.",
    keywords: "QR menu demo, restaurant demo, table ordering demo",
  },
  auth: {
    title: "Sign In / Create Account",
    description:
      "Sign in to your restroMenu dashboard or create a free account to start managing your restaurant's digital menu.",
    keywords: "sign in, create account, restaurant dashboard",
  },
  dashboard: {
    title: "Restaurant Dashboard",
    description:
      "Manage your menu, view orders, track analytics, and run your restaurant from the restroMenu dashboard.",
    keywords: "restaurant dashboard, order management, menu management",
  },
  contact: {
    title: "Contact Us",
    description:
      "Get in touch with the restroMenu team. We're here to help your restaurant succeed.",
    keywords: "contact support, customer service, restaurant support",
  },
};

/**
 * Product structured data for rich snippets
 */
export const getProductStructuredData = () => ({
  "@context": "https://schema.org/",
  "@type": "SoftwareApplication",
  name: "restroMenu",
  applicationCategory: "BusinessApplication",
  description:
    "QR-based digital menu ordering system with integrated POS for restaurants and hotels",
  url: SITE_URL,
  screenshot: `${SITE_URL}/screenshot.png`,
  operatingSystem: "Web-based, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free forever plan available",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2800",
    bestRating: "5",
    worstRating: "1",
  },
});

/**
 * Breadcrumb structured data
 */
export const getBreadcrumbStructuredData = (path) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: path.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`,
  })),
});

/**
 * FAQ structured data
 */
export const getFAQStructuredData = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
});

/**
 * Organization structured data
 */
export const getOrganizationStructuredData = () => ({
  "@context": "https://schema.org/",
  "@type": "Organization",
  name: "restroMenu",
  url: SITE_URL,
  logo: SITE_LOGO,
  description:
    "Digital QR code menus for restaurants & hotels with integrated POS and table ordering.",
  sameAs: [
    "https://www.facebook.com/restromenu",
    "https://twitter.com/restromenu",
    "https://www.linkedin.com/company/restromenu",
    "https://www.instagram.com/restromenu",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    telephone: "+91-XXXXXXXXXX",
    email: "support@restromenu.com",
  },
});

/**
 * LocalBusiness structured data
 */
export const getLocalBusinessStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "restroMenu",
  description: "Digital QR menu and POS solution for restaurants and hotels",
  image: SITE_LOGO,
  url: SITE_URL,
  telephone: "+91-XXXXXXXXXX",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressLocality: "India",
  },
});

/**
 * Article structured data (for blog posts)
 */
export const getArticleStructuredData = (article) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified,
  author: {
    "@type": "Organization",
    name: "restroMenu",
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: "restroMenu",
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
  },
});

/**
 * Review/Rating structured data
 */
export const getReviewStructuredData = (reviews) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: "restroMenu",
  description: "Digital QR code menu for restaurants",
  url: SITE_URL,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: reviews.length,
  },
  review: reviews.map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.stars,
    },
    reviewBody: review.quote,
  })),
});

export default {
  updateMetaTag,
  updatePageMeta,
  updateOGImage,
  updateCanonicalURL,
  addStructuredData,
  pageMetaConfig,
  getProductStructuredData,
  getBreadcrumbStructuredData,
  getFAQStructuredData,
  getOrganizationStructuredData,
  getLocalBusinessStructuredData,
  getArticleStructuredData,
  getReviewStructuredData,
};
