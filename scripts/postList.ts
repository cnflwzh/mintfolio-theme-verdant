import type { PageScope } from './lifecycle';
import type { PostFilters, PostItem } from '../utils/types';

import { createPostListController, searchPosts } from '@mintfolio/core/client';
export { emptyFilters } from '@mintfolio/core/client';

interface PostListSnapshot {
  href: string;
  limit: number;
  autoLoadEnabled: boolean;
  filters: PostFilters;
}

const stateKey = 'personalSitePostList';

function readSnapshot(url: URL): PostListSnapshot | null {
  const value: Partial<PostListSnapshot> | undefined = history.state?.[stateKey];
  if (value?.href !== `${url.pathname}${url.search}` || typeof value.limit !== 'number' || !Number.isInteger(value.limit) || value.limit < 1) return null;
  if (!value.filters || !['q', 'tag', 'category'].every((key) => typeof value.filters?.[key as keyof PostFilters] === 'string')) return null;
  return { href: value.href, limit: value.limit, autoLoadEnabled: value.autoLoadEnabled === true, filters: value.filters };
}

/** Restore layout before Astro restores scroll, otherwise the short initial list clamps it. */
function restoreListDocument(root: Document, url: URL, snapshot: PostListSnapshot | null): void {
  const hero = root.querySelector<HTMLElement>('#hero');
  if (hero && url.hash === '#content') {
    hero.classList.add('collapsed');
    hero.inert = true;
    root.querySelector('.content-wrapper')?.classList.add('hero-collapsed');
  }
  if (!snapshot || !root.getElementById('posts-list')) return;
  const items = readPostItems(root.getElementById('posts-list')!);
  const matches = filterPostItems(items, snapshot.filters);
  const visible = new Set(matches.slice(0, snapshot.limit));
  for (const item of items) {
    item.element.classList.toggle('hidden', !visible.has(item));
    item.element.classList.remove('initially-hidden');
  }
  root.getElementById('load-more-wrap')?.classList.toggle('hidden', matches.length <= snapshot.limit);
}

document.addEventListener('astro:before-preparation', () => {
  // Stop an article's smooth section scroll before its queued frames can move the next page.
  window.scrollTo({ left: window.scrollX, top: window.scrollY, behavior: 'instant' });
});

document.addEventListener('astro:before-swap', (event) => {
  // Astro restores history coordinates before page-load; CSS smooth scrolling can interrupt that restoration.
  if (event.navigationType === 'traverse') event.newDocument.documentElement.dataset.restoringScroll = 'true';
  restoreListDocument(event.newDocument, event.to, event.navigationType === 'traverse' ? readSnapshot(event.to) : null);
});
document.addEventListener('astro:page-load', () => { delete document.documentElement.dataset.restoringScroll; });
restoreListDocument(document, new URL(location.href), readSnapshot(new URL(location.href)));

export function readPostItems(root: ParentNode): PostItem[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.post-card'), (element) => ({
    element,
    id: element.dataset.id ?? '',
    url: element.dataset.url ?? '',
    title: element.dataset.title ?? '',
    description: element.dataset.description ?? '',
    tags: JSON.parse(element.dataset.tags ?? '[]') as string[],
    category: element.dataset.category ?? '',
  }));
}

export function filterPostItems(posts: PostItem[], filters: PostFilters): PostItem[] {
  return searchPosts(posts, filters);
}

/** A single observer and DOM index serve both the home and blog lists. */
export function createPostList(scope: PageScope) {
  const container = document.getElementById('posts-list');
  const button = document.getElementById('load-more-btn');
  const footer = document.getElementById('load-more-wrap');
  const noResults = document.getElementById('no-results');
  const items = readPostItems(container ?? document);
  const pageSize = Number(container?.dataset.pageSize) || 8;
  const saved = readSnapshot(new URL(location.href));
  const controller = createPostListController({ items, index: (item) => item, pageSize, initialFilters: saved?.filters, initialLimit: saved?.limit });
  scope.add(controller.dispose);
  let autoLoadEnabled = saved?.autoLoadEnabled ?? false;
  let leftViewport = false;

  const render = (): void => {
    const { matches, visible: shown, limit, filters } = controller.value();
    const visible = new Set(shown);
    for (const item of items) {
      item.element.classList.toggle('hidden', !visible.has(item));
      item.element.classList.remove('initially-hidden');
    }
    if (noResults) noResults.style.display = matches.length ? 'none' : 'block';
    footer?.classList.toggle('hidden', matches.length <= limit);
    const snapshot: PostListSnapshot = { href: `${location.pathname}${location.search}`, limit, autoLoadEnabled, filters };
    history.replaceState({ ...history.state, [stateKey]: snapshot }, '');
  };
  const loadMore = (): void => {
    leftViewport = false;
    controller.loadMore();
  };
  button?.addEventListener(
    'click',
    () => {
      autoLoadEnabled = true;
      loadMore();
    },
    { signal: scope.signal },
  );

  if (footer) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) leftViewport = true;
        else if (autoLoadEnabled && leftViewport && controller.value().hasMore) loadMore();
      },
      { rootMargin: '0px 0px 160px 0px', threshold: 0.15 },
    );
    observer.observe(footer);
    scope.add(() => observer.disconnect());
  }

  scope.add(controller.subscribe(render));
  return {
    items,
    filter(nextFilters: PostFilters): void {
      const current = controller.value().filters;
      if (current.q !== nextFilters.q || current.tag !== nextFilters.tag || current.category !== nextFilters.category) leftViewport = false;
      controller.setFilters(nextFilters);
    },
  };
}
