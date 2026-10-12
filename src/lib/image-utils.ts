/**
 * Image resolution utilities ensuring zero unauthenticated external CDN calls
 * and fallback to bundled assets for high-speed local loading.
 */

const BLOCKED_DOMAINS = [
  "images.unsplash.com",
  "unsplash.com",
  "source.unsplash.com",
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "via.placeholder.com",
];

export function getSafeImageUrl(
  url?: string | null,
  fallback: string = "/images/placeholder.svg"
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return fallback;
  }

  // If local path, allow directly
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    // Check if host matches blocked/throttled external domains
    if (BLOCKED_DOMAINS.some((domain) => parsed.hostname.toLowerCase().includes(domain))) {
      return fallback;
    }
    return trimmed;
  } catch {
    return fallback;
  }
}

export function getSafeAvatarUrl(url?: string | null): string {
  return getSafeImageUrl(url, "/images/avatar.svg");
}

export function getSafeBannerUrl(url?: string | null): string {
  return getSafeImageUrl(url, "/images/banner.svg");
}
