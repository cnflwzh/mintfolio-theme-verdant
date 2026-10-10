/**
 * Format a displayed date using the site's language and publication timezone.
 * @param value ISO timestamp from Core, or a Date for a current calendar label.
 * @param language Site language used by Intl.DateTimeFormat.
 * @param timezone Site publication timezone; omitted values use Core's UTC default.
 * @param options Calendar fields to display; the site timezone always takes precedence.
 * @returns A localized label for the same instant used by the article metadata.
 * @throws RangeError for an invalid timestamp, locale, or timezone.
 */
export function formatSiteDate(
  value: string | Date,
  language: string,
  timezone = 'UTC',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return new Intl.DateTimeFormat(language, { ...options, timeZone: timezone })
    .format(typeof value === 'string' ? new Date(value) : value);
}
