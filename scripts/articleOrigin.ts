interface ArticleOrigin {
  href: string;
  index: number;
}

const stateKey = 'personalSiteArticleOrigin';
let pending: { destination: string; origin: ArticleOrigin } | null = null;

/** Capture the actual history entry so article anchors can be skipped on return. */
export function rememberArticleOrigin(destination: string, href: string): void {
  const index: unknown = history.state?.index;
  pending = typeof index === 'number' && Number.isInteger(index)
    ? { destination, origin: { href, index } }
    : null;
}

export function persistArticleOrigin(origin: ArticleOrigin): void {
  history.replaceState({ ...history.state, [stateKey]: origin }, '');
}

export function readArticleOrigin(): ArticleOrigin | null {
  const candidate: Partial<ArticleOrigin> | undefined = pending?.destination === location.pathname
    ? pending.origin
    : history.state?.[stateKey];
  pending = null;
  if (typeof candidate?.href !== 'string' || typeof candidate.index !== 'number' || !Number.isInteger(candidate.index)) return null;
  if (new URL(candidate.href, location.origin).origin !== location.origin) return null;
  const origin = { href: candidate.href, index: candidate.index };
  persistArticleOrigin(origin);
  return origin;
}
