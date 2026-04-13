/**
 * Example: How to use SEO utilities in your React components
 * This file demonstrates best practices for implementing SEO in different pages
 */

// ============================================================================
// EXAMPLE 1: Landing Page with SEO Hook
// ============================================================================

import { useEffect } from "react";
import useSEO from "../hooks/useSEO";
import { addStructuredData, getFAQStructuredData } from "../utils/seo";
import { FAQS } from "../data/database";

export function LandingPageExample() {
  // Use predefined SEO config for landing page
  useSEO("landing");

  // Add FAQ structured data
  useEffect(() => {
    addStructuredData(getFAQStructuredData(FAQS));
  }, []);

  return <div>{/* Landing page content */}</div>;
}

// ============================================================================
// EXAMPLE 2: Custom Page with Dynamic Meta Tags
// ============================================================================

import { useEffect } from "react";
import useSEO from "../hooks/useSEO";

export function CustomPageExample() {
  useSEO({
    title: "Restaurant QR Menu System - restroMenu",
    description:
      "Transform your restaurant with contactless QR code menus. Enable table ordering and integrated POS billing.",
    keywords: "restaurant QR menu, table ordering, POS system",
    url: "/restaurant-qr-menu",
  });

  return <div>{/* Page content */}</div>;
}

// ============================================================================
// EXAMPLE 3: Blog Post with Article Schema
// ============================================================================

import { useEffect } from "react";
import useSEO from "../hooks/useSEO";
import { addStructuredData, getArticleStructuredData } from "../utils/seo";

export function BlogPostExample() {
  const articleData = {
    title: "How QR Code Menus Increase Restaurant Revenue",
    description:
      "Learn how digital QR menus can increase your average order value by 40% and reduce wait times.",
    image: "https://restromenu.com/blog/qr-menu-revenue.jpg",
    datePublished: "2024-04-10T08:00:00Z",
    dateModified: "2024-04-13T10:30:00Z",
  };

  useSEO({
    title: articleData.title,
    description: articleData.description,
    keywords:
      "QR menu revenue, restaurant revenue increase, digital menu benefits",
    url: "/blog/qr-menu-revenue",
  });

  useEffect(() => {
    addStructuredData(getArticleStructuredData(articleData));
  }, []);

  return <article>{/* Blog post content */}</article>;
}

// ============================================================================
// EXAMPLE 4: Product/Feature Page with Rich Snippets
// ============================================================================

import { useEffect } from "react";
import useSEO from "../hooks/useSEO";
import {
  addStructuredData,
  getProductStructuredData,
  getReviewStructuredData,
} from "../utils/seo";
import { TESTIMONIALS } from "../data/database";

export function ProductPageExample() {
  useSEO({
    title: "Table Ordering System - restroMenu",
    description:
      "Enable seamless table ordering with our QR-based system. Reduce wait times, increase orders, and improve guest satisfaction.",
    keywords: "table ordering system, restaurant ordering, QR ordering",
    url: "/features/table-ordering",
  });

  useEffect(() => {
    addStructuredData(getProductStructuredData());
    addStructuredData(getReviewStructuredData(TESTIMONIALS));
  }, []);

  return <section>{/* Feature page content */}</section>;
}

// ============================================================================
// EXAMPLE 5: Category/Collection Page with Breadcrumbs
// ============================================================================

import { useEffect } from "react";
import useSEO from "../hooks/useSEO";
import {
  addStructuredData,
  getBreadcrumbStructuredData,
} from "../utils/seo";

export function CategoryPageExample() {
  const breadcrumbPath = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
    { name: "Restaurant Tools", url: "/features/restaurant-tools" },
  ];

  useSEO({
    title: "Restaurant Management Tools - restroMenu",
    description:
      "Complete restaurant management solution: QR menus, table ordering, POS integration, and analytics.",
    keywords:
      "restaurant tools, restaurant management, POS, ordering system",
    url: "/features/restaurant-tools",
  });

  useEffect(() => {
    addStructuredData(getBreadcrumbStructuredData(breadcrumbPath));
  }, []);

  return <section>{/* Category page content */}</section>;
}

// ============================================================================
// EXAMPLE 6: Dynamic Page Using Route Params
// ============================================================================

import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSEO from "../hooks/useSEO";
import { updatePageMeta, updateCanonicalURL } from "../utils/seo";

export function DynamicPageExample() {
  const { restaurantId } = useParams();

  useEffect(() => {
    // Fetch restaurant data
    const restaurant = {
      name: "The Italian Kitchen",
      description:
        "Award-winning Italian restaurant with authentic recipes and fresh ingredients.",
      cuisine: "Italian",
    };

    updatePageMeta(
      `${restaurant.name} - Order Online`,
      `Discover ${restaurant.name}. ${restaurant.description}`,
      `${restaurant.name}, ${restaurant.cuisine} restaurant, online ordering`
    );

    updateCanonicalURL(
      `https://restromenu.com/restaurant/${restaurantId}`
    );
  }, [restaurantId]);

  return <div>{/* Dynamic page content */}</div>;
}

// ============================================================================
// EXAMPLE 7: Performance Optimization Tips
// ============================================================================

/*
BEST PRACTICES:

1. SEO HOOK USAGE
   - Call useSEO at the top of your component
   - Pass either a string (predefined config) or object (custom config)
   - One hook per page/component

2. STRUCTURED DATA
   - Add structured data for rich snippets
   - Use appropriate schema types (Product, Article, FAQ, etc.)
   - Validate with https://schema.org/

3. KEYWORDS
   - Use 3-5 primary keywords per page
   - Include keywords in title and description
   - Don't keyword stuff - keep it natural
   - Use long-tail keywords for specific pages

4. META DESCRIPTIONS
   - Keep 150-160 characters
   - Include primary keyword naturally
   - Write compelling copy to improve CTR
   - Make it unique for each page

5. IMAGES
   - Always add alt text (especially for SVG/PNG)
   - Use descriptive filenames
   - Compress images for performance
   - Use WebP format where possible

6. INTERNAL LINKING
   - Link to related pages
   - Use descriptive anchor text
   - Avoid too many outbound links per page
   - Use rel="noopener noreferrer" for external links

7. PERFORMANCE
   - Optimize Core Web Vitals
   - Use code splitting for lazy loading
   - Minify CSS/JavaScript
   - Implement caching strategies

8. MOBILE OPTIMIZATION
   - Ensure mobile-responsive design
   - Test on multiple devices
   - Optimize touch targets
   - Ensure fast mobile load times
*/

export default {
  LandingPageExample,
  CustomPageExample,
  BlogPostExample,
  ProductPageExample,
  CategoryPageExample,
  DynamicPageExample,
};
