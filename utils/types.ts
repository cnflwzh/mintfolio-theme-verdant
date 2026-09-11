import type { SearchEntry } from '@mintfolio/theme-api';

export type { PostFilters } from '@mintfolio/theme-api';

/** The Verdant Theme attaches a card element to the SDK's public search entry. */
export interface PostItem extends SearchEntry {
  element: HTMLElement;
}
