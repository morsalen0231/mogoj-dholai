const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export function getSiteUrl() {
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
