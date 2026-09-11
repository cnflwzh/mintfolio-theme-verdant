/**
 * @fileoverview Home return hint utilities for managing the "return to hero" hint display state.
 * Controls when to show the hint button that appears when the hero section is collapsed on the home page.
 */

/**
 * Local storage key for tracking whether the home return hint has been dismissed.
 * Once dismissed, the hint won't show again on subsequent visits.
 */
export const HOME_RETURN_HINT_STORAGE_KEY = 'home-return-hint-dismissed';

/**
 * Determines whether the home return hint should be displayed.
 * 
 * The hint is shown only once per user - after they see it and it auto-dismisses,
 * the value is set to '1' in localStorage and the hint won't appear again.
 * 
 * @param storageValue - The current value from localStorage (null if not set)
 * @returns True if the hint should be shown (not yet dismissed)
 * 
 * @example
 * ```ts
 * const showHint = shouldShowHomeReturnHint(
 *   localStorage.getItem('home-return-hint-dismissed')
 * );
 * if (showHint) {
 *   // Display the hint and mark as dismissed
 *   localStorage.setItem('home-return-hint-dismissed', '1');
 * }
 * ```
 */
export function shouldShowHomeReturnHint(storageValue: string | null): boolean {
  return storageValue !== '1';
}
