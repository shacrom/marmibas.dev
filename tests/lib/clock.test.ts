/**
 * Tests for `formatClockTime` (`src/lib/clock.ts`) — T2 terminal redesign.
 *
 * Plan (strict TDD — this file is written and observed RED before
 * `src/lib/clock.ts` exists):
 *   1. Winter instant (CET, UTC+1) formats to local 24h HH:MM:SS.
 *   2. Summer instant (CEST, UTC+2) formats to local 24h HH:MM:SS — proves
 *      DST is honoured, not a fixed UTC+1 offset.
 *   3. An instant that crosses local midnight formats as `00:MM:SS`, never
 *      `24:MM:SS` (hourCycle: 'h23' contract).
 *   4. A custom `timeZone` argument (`UTC`) overrides the Europe/Madrid
 *      default and is honoured verbatim.
 *   5. Default parameter: omitting `timeZone` behaves like passing
 *      'Europe/Madrid' explicitly.
 */

import { describe, expect, it } from 'vitest';
import { formatClockTime } from '../../src/lib/clock';

describe('formatClockTime', () => {
  it('formats a winter (CET, UTC+1) instant as local 24h HH:MM:SS', () => {
    const date = new Date('2026-01-15T12:34:56Z');
    expect(formatClockTime(date)).toBe('13:34:56');
  });

  it('formats a summer (CEST, UTC+2) instant as local 24h HH:MM:SS', () => {
    const date = new Date('2026-07-15T12:34:56Z');
    expect(formatClockTime(date)).toBe('14:34:56');
  });

  it('never renders 24:MM:SS when the instant crosses local midnight', () => {
    const date = new Date('2026-01-15T23:00:05Z');
    expect(formatClockTime(date)).toBe('00:00:05');
  });

  it('honours a custom timeZone argument instead of the Europe/Madrid default', () => {
    const date = new Date('2026-01-15T12:34:56Z');
    expect(formatClockTime(date, 'UTC')).toBe('12:34:56');
  });

  it('defaults to Europe/Madrid when timeZone is omitted', () => {
    const date = new Date('2026-01-15T12:34:56Z');
    expect(formatClockTime(date)).toBe(formatClockTime(date, 'Europe/Madrid'));
  });
});
