/**
 * `formatClockTime` — live "hora en España" clock formatter (T2 terminal
 * redesign, `TASKS.md`/`odd/tasks/terminal-redesign.md` T2).
 *
 * Used by the terminal header's `{{ clock }}` slot (DESIGN.md §8 pane
 * header contract; the Header component itself is wired in T3). Formats a
 * `Date` as a 24h `HH:MM:SS` string in a given IANA time zone, defaulting
 * to `Europe/Madrid` so the displayed time is always "hora en España"
 * regardless of the visitor's own locale/offset.
 *
 * `Intl.DateTimeFormat` with `hourCycle: 'h23'` already returns exactly
 * `HH:MM:SS` for the `es-ES` locale (verified: hour/minute/second literals
 * joined by `:`, no AM/PM marker, midnight renders `00`, never `24`), so
 * this is a thin, defensive wrapper rather than a manual parts-assembler.
 */

const DEFAULT_TIME_ZONE = 'Europe/Madrid';

/**
 * Formats `date` as a local 24h `HH:MM:SS` string in `timeZone`.
 *
 * @param date - The instant to format.
 * @param timeZone - IANA time zone identifier. Defaults to
 *   `'Europe/Madrid'` (DST-aware: CET in winter, CEST in summer).
 * @returns `HH:MM:SS`, always two-digit fields, always `00`–`23` for hours
 *   (never `24`).
 */
export function formatClockTime(date: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    return formatter.format(date);
  } catch {
    // Defensive fallback if `Intl` throws (e.g. an invalid/unsupported
    // `timeZone` string). Falls back to UTC-based formatting rather than
    // attempting manual offset math, which cannot account for DST.
    return formatClockTimeUtcFallback(date);
  }
}

/**
 * UTC-based `HH:MM:SS` formatter used only when `Intl.DateTimeFormat`
 * throws. Not timezone-aware — it is a last resort so the clock never
 * renders an empty/garbled string, not a substitute for real TZ support.
 */
function formatClockTimeUtcFallback(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}
