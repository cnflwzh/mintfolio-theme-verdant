import type { ArticleHeading } from '@mintfolio/theme-api/astro';

/**
 * Rebuild the Default Theme's TOC from authenticated headings after unlocking.
 * The template contains no article metadata. Cloning its empty link preserves
 * Astro's scoped CSS attributes; textContent keeps heading labels inert.
 */
export function createArticleToc(root: HTMLElement, headings: ArticleHeading[]): DocumentFragment {
  const result = document.createDocumentFragment();
  const visible = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  const template = root.querySelector<HTMLTemplateElement>('[data-toc-template]');
  if (!visible.length || !template) return result;

  const contents = template.content.cloneNode(true) as DocumentFragment;
  const nav = contents.querySelector('.toc-nav');
  const example = nav?.querySelector<HTMLAnchorElement>('.toc-link');
  if (!nav || !example) return result;

  const links = visible.map((heading): HTMLAnchorElement => {
    const link = example.cloneNode(false) as HTMLAnchorElement;
    link.className = `toc-link depth-${heading.depth}`;
    link.setAttribute('href', `#${heading.slug}`);
    link.textContent = heading.text;
    return link;
  });
  nav.replaceChildren(...links);
  result.append(contents);
  return result;
}
