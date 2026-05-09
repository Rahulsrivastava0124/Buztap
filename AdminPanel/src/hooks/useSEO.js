import { useEffect } from "react";
import {
  updatePageMeta,
  updateCanonicalURL,
  updateOGImage,
  updateRobotsMeta,
  addStructuredData,
  pageMetaConfig,
} from "../utils/seo";

const PRIMARY_DOMAIN =
  import.meta.env.VITE_SITE_URL || "https://restro.buzingbee.com";

/**
 * Hook to update page SEO meta tags and structured data
 *
 * Usage:
 * useSEO("landing")
 * useSEO({
 *   title: "Custom Title",
 *   description: "Custom description",
 *   keywords: "custom, keywords",
 *   url: "/custom-path",
 *   structuredData: {...}
 * })
 */
export const useSEO = (config) => {
  useEffect(() => {
    if (typeof config === "string") {
      // Use predefined config
      const pageConfig = pageMetaConfig[config];
      if (pageConfig) {
        updatePageMeta(
          pageConfig.title,
          pageConfig.description,
          pageConfig.keywords,
        );
        updateCanonicalURL(`${PRIMARY_DOMAIN}${pageConfig.url || "/"}`);
        updateRobotsMeta(pageConfig.robots);

        if (pageConfig.structuredData) {
          addStructuredData(pageConfig.structuredData);
        }
      }
    } else if (typeof config === "object") {
      // Use custom config
      const {
        title,
        description,
        keywords,
        url,
        structuredData,
        robots,
        ogImage,
      } = config;

      if (title && description) {
        updatePageMeta(title, description, keywords);
      }

      if (url) {
        updateCanonicalURL(`${PRIMARY_DOMAIN}${url}`);
      }

      updateRobotsMeta(robots);

      if (ogImage) {
        updateOGImage(ogImage);
      }

      if (structuredData) {
        addStructuredData(structuredData);
      }
    }
  }, [config]);
};

export default useSEO;
