import { useEffect } from "react";
import {
  updatePageMeta,
  updateCanonicalURL,
  addStructuredData,
  pageMetaConfig,
} from "../utils/seo";

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
          pageConfig.keywords
        );
        updateCanonicalURL(`https://restromenu.com/${config === "landing" ? "" : config}`);
      }
    } else if (typeof config === "object") {
      // Use custom config
      const { title, description, keywords, url, structuredData } = config;
      
      if (title && description) {
        updatePageMeta(title, description, keywords);
      }
      
      if (url) {
        updateCanonicalURL(`https://restromenu.com${url}`);
      }
      
      if (structuredData) {
        addStructuredData(structuredData);
      }
    }
  }, [config]);
};

export default useSEO;
