const FALLBACK_SITE_URL = "https://www.ambalajeconstanta.ro"

/**
 * Public origin of the storefront, without a trailing slash.
 * Used for absolute URLs in robots.txt and sitemap.xml.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_SITE_URL
).replace(/\/+$/, "")

export const DEFAULT_COUNTRY_CODE =
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "ro"
