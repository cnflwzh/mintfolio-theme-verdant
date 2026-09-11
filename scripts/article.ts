import { navigate } from 'astro:transitions/client';
import { ARTICLE_BACK_NAV_STORAGE_KEY, resolveStoredArticleBackHref } from '../utils/blogNavigation';
import { readStorage } from '../utils/storage';
import { onPage } from './lifecycle';
import { initTocDrawer } from './toc';
import { initLightbox } from './lightbox';
import { readArticleOrigin, persistArticleOrigin } from './articleOrigin';
import { initArticleTables } from './articleTables';

onPage('.blog-post', (_root, scope) => {
  document.documentElement.classList.add('blog-article-page');
  scope.add(() => document.documentElement.classList.remove('blog-article-page'));
  const origin = readArticleOrigin();
  // Keep the return target when an article heading creates a new history entry.
  window.addEventListener('hashchange', () => {
    if (origin) persistArticleOrigin(origin);
  }, { signal: scope.signal });
  document.getElementById('back-btn')?.addEventListener(
    'click',
    () => {
      const currentIndex: unknown = history.state?.index;
      if (origin && typeof currentIndex === 'number' && origin.index < currentIndex) {
        history.go(origin.index - currentIndex);
        return;
      }
      const href = resolveStoredArticleBackHref({
        storedHref: origin?.href ?? readStorage('session', ARTICLE_BACK_NAV_STORAGE_KEY),
        currentPath: location.pathname,
        currentOrigin: location.origin,
        fallbackHref: document.body.dataset.archiveHref ?? location.href,
      });
      void navigate(href);
    },
    { signal: scope.signal },
  );
});

onPage('.article-prose', (root, scope) => {
  initTocDrawer(scope);
  initLightbox(root, scope);
  initArticleTables(root, scope);
});
