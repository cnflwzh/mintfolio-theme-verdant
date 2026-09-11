import { navigate } from 'astro:transitions/client';
import type { PageScope } from './lifecycle';
import type { PostItem } from '../utils/types';
import { createPostFilters, writeFiltersToUrl } from './postFilters';
import { createTagFold } from './tagFold';

export function initHomePanels(hero: HTMLElement, items: PostItem[], scope: PageScope): void {
  const options = { signal: scope.signal };
  const search = document.querySelector<HTMLDialogElement>('#search-modal');
  const input = document.querySelector<HTMLInputElement>('#search-modal-input');
  const searchToggle = document.getElementById('search-float-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-drawer-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  const fold = createTagFold(
    document.getElementById('tags-filter'),
    document.getElementById('home-tags-filter-toggle'),
    scope,
  );
  const filters = createPostFilters(items, input, scope, () => fold.refresh());
  const apply = (): void => {
    const url = writeFiltersToUrl(filters.value(), new URL(document.body.dataset.archiveHref ?? location.href, location.origin));
    void navigate(`${url.pathname}${url.search}`);
  };
  searchToggle?.addEventListener(
    'click',
    () => {
      search?.showModal();
      fold.refresh();
      input?.focus();
    },
    options,
  );
  document.getElementById('search-close-btn')?.addEventListener('click', () => search?.close(), options);
  document.getElementById('search-apply-btn')?.addEventListener('click', apply, options);
  search?.addEventListener(
    'click',
    (event) => {
      if (event.target === search) search.close();
    },
    options,
  );
  input?.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        apply();
      }
    },
    options,
  );
  const setSidebar = (open: boolean): void => {
    sidebar?.classList.toggle('open', open);
    overlay?.classList.toggle('open', open);
    sidebarToggle?.classList.toggle('open', open);
    sidebarToggle?.setAttribute('aria-expanded', String(open));
    sidebarToggle?.setAttribute('aria-label', open ? '关闭侧边栏' : '打开侧边栏');
    document.body.classList.toggle('sidebar-drawer-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  sidebarToggle?.addEventListener('click', () => setSidebar(!sidebar?.classList.contains('open')), options);
  overlay?.addEventListener('click', () => setSidebar(false), options);
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && sidebar?.classList.contains('open')) {
        setSidebar(false);
        sidebarToggle?.focus();
      }
    },
    options,
  );
  let heroVisible = true;
  const update = (): void => {
    searchToggle?.classList.toggle('visible', !heroVisible);
    sidebarToggle?.classList.toggle('visible', !heroVisible && window.innerWidth < 900);
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      heroVisible = entry?.isIntersecting ?? false;
      update();
    },
    { threshold: 0.1 },
  );
  observer.observe(hero);
  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth >= 900) setSidebar(false);
      update();
    },
    options,
  );
  scope.add(() => {
    observer.disconnect();
    search?.close();
    setSidebar(false);
  });
}
