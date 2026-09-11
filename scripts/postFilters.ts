import type { PageScope } from './lifecycle';
import { emptyFilters } from './postList';
import type { PostFilters, PostItem } from '../utils/types';

import { createPostListController, readFiltersFromUrl as readUrlFilters, writeFiltersToUrl as writeUrlFilters } from '@mintfolio/core/client';

/** Read the current document's query state through the same parser used by Core. */
export function readFiltersFromUrl(): PostFilters {
  return readUrlFilters(new URL(window.location.href));
}

/** The caller supplies a Core-owned destination; the SDK only updates filter parameters. */
export function writeFiltersToUrl(filters: PostFilters, url = new URL(window.location.href)): URL {
  return writeUrlFilters(filters, url);
}

export function createPostFilters(
  items: PostItem[],
  input: HTMLInputElement | null,
  scope: PageScope,
  onChange: (filters: PostFilters) => void,
  initial: PostFilters = emptyFilters(),
) {
  const tagButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.tag-btn'));
  const categoryButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.category-btn'));
  const state = { ...initial };
  const includes = (buttons: HTMLButtonElement[], key: 'tag' | 'category', value: string): boolean =>
    buttons.some((button) => button.dataset[key] === value);
  if (!includes(tagButtons, 'tag', state.tag)) state.tag = '';
  if (!includes(categoryButtons, 'category', state.category)) state.category = '';
  if (input) input.value = state.q;

  const controller = createPostListController({ items, index: (item) => item, initialFilters: state, reconcileFacets: true });
  scope.add(controller.dispose);
  scope.add(controller.subscribe((snapshot) => {
    Object.assign(state, snapshot.filters);
    const tags = new Set(snapshot.facets.tags);
    const categories = new Set(snapshot.facets.categories);
    const updateButtons = (
      buttons: HTMLButtonElement[],
      key: 'tag' | 'category',
      available: Set<string>,
    ): void => {
      for (const button of buttons) {
        const value = button.dataset[key] ?? '';
        const selected = value === state[key];
        button.disabled = Boolean(value) && !available.has(value.toLowerCase());
        button.classList.toggle('hidden-by-filter', button.disabled);
        button.classList.toggle('active', selected);
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
      }
    };
    updateButtons(tagButtons, 'tag', tags);
    updateButtons(categoryButtons, 'category', categories);
    onChange({ ...state });
  }));

  const bindGroup = (buttons: HTMLButtonElement[], key: 'tag' | 'category'): void => {
    for (const button of buttons) {
      button.addEventListener(
        'click',
        () => {
          controller.setFilters({ [key]: button.dataset[key] ?? '' });
        },
        { signal: scope.signal },
      );
      button.addEventListener(
        'keydown',
        (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const visible = buttons.filter((candidate) => !candidate.disabled);
          const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1;
          const index =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? visible.length - 1
                : (visible.indexOf(button) + direction + visible.length) % visible.length;
          const next = visible[index];
          if (next) {
            next.click();
            next.focus();
          }
        },
        { signal: scope.signal },
      );
    }
  };
  bindGroup(tagButtons, 'tag');
  bindGroup(categoryButtons, 'category');
  input?.addEventListener(
    'input',
    () => {
      controller.setFilters({ q: input.value });
    },
    { signal: scope.signal },
  );
  return { value: (): PostFilters => ({ ...state }) };
}
