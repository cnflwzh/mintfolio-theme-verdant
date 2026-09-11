import { onPage } from './lifecycle';
import { createPostList } from './postList';
import { createPostFilters, readFiltersFromUrl, writeFiltersToUrl } from './postFilters';
import { createTagFold } from './tagFold';

onPage('.blog-page', (_root, scope) => {
  const list = createPostList(scope);
  const fold = createTagFold(
    document.getElementById('tags-filter'),
    document.getElementById('blog-tags-filter-toggle'),
    scope,
  );
  const input = document.querySelector<HTMLInputElement>('#search-input');
  createPostFilters(
    list.items,
    input,
    scope,
    (filters) => {
      const url = writeFiltersToUrl(filters);
      if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
      list.filter(filters);
      fold.refresh();
    },
    readFiltersFromUrl(),
  );
});
