import type { PublicImage } from '@mintfolio/theme-api';

/** Compare equivalent Unicode and percent-encoded path segments without decoding separators. */
function normalizedPath(path: string): string {
  return path.split('/').map((segment) => {
    let decoded = segment;
    try { decoded = decodeURIComponent(segment); }
    catch { /* A malformed escape remains literal; resolving a theme URL does not validate it. */ }
    return encodeURIComponent(decoded.normalize('NFC'));
  }).join('/');
}

/**
 * Resolve a root-relative URL owned by Verdant's display settings under Astro base.
 * @param value Theme-configured image or link; Core-projected URLs need no conversion.
 * @returns PublicImage objects unchanged, or a URL with one base prefix. Absolute, protocol-relative, fragment,
 * query-only and relative URLs are unchanged. Equivalent existing prefixes keep
 * the original URL spelling, including Unicode normalization and percent encoding.
 */
export function resolveThemeUrl(value: string): string;
export function resolveThemeUrl(value: PublicImage): PublicImage;
export function resolveThemeUrl(value: string | PublicImage): string | PublicImage;
export function resolveThemeUrl(value: string | PublicImage): string | PublicImage {
  if (typeof value !== 'string') return value;
  if (!value.startsWith('/') || value.startsWith('//')) return value;
  const base = normalizedPath(import.meta.env.BASE_URL).replace(/\/+$/, '');
  const path = normalizedPath(value.split(/[?#]/, 1)[0]);
  if (!base || path === base || path.startsWith(`${base}/`)) return value;
  return `${base}${value}`;
}
