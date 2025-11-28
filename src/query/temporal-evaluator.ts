/**
 * Temporal Query Evaluator for TONL Query API
 *
 * Provides temporal query capabilities including:
 * - Date literal parsing (@2024-01-15, @now, @now-7d)
 * - Temporal comparison operators (before, after, between)
 * - Relative time expressions (daysAgo, weeksAgo, monthsAgo)
 * - ISO 8601 duration support
 *
 * @example
 * ```typescript
 * // Query filters with temporal expressions:
 * doc.query("events[?(@.date > @now-7d)]")        // Last 7 days
 * doc.query("events[?(@.date between @2024-01-01 @2024-12-31)]")
 * doc.query("posts[?(@.publishedAt before @now)]")
 * ```
 */

import { SecurityError } from '../errors/index.js';

/**
 * Parsed temporal value
 */
export interface TemporalValue {
  /**
   * Unix timestamp in milliseconds
   */
  timestamp: number;

  /**
   * JavaScript Date object
   */
  date: Date;

  /**
   * ISO 8601 string representation
   */
  iso: string;

  /**
   * Original input string
   */
  original: string;

  /**
   * Whether this is a relative time expression
   */
  isRelative: boolean;
}

/**
 * Duration value (ISO 8601 duration)
 */
export interface DurationValue {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * Temporal query options
 */
export interface TemporalOptions {
  /**
   * Timezone for date parsing (default: local)
   */
  timezone?: string;

  /**
   * Reference time for relative expressions (default: now)
   */
  referenceTime?: Date | number;

  /**
   * Whether to use start of day for date-only values
   * @default true
   */
  startOfDay?: boolean;

  /**
   * Whether to use end of day for date-only comparisons
   * @default false
   */
  endOfDay?: boolean;
}

/**
 * Maximum timestamp to prevent integer overflow
 */
const MAX_TIMESTAMP = 8640000000000000; // Max Date value in JavaScript

/**
 * Temporal literal prefixes
 */
const TEMPORAL_PREFIX = '@';

// ========================================
// Date Parsing Functions
// ========================================

/**
 * Parse a temporal literal string
 *
 * Supports:
 * - ISO 8601 dates: @2024-01-15, @2024-01-15T10:30:00Z
 * - Relative expressions: @now, @now-7d, @now+1w, @now-3M
 * - Named dates: @today, @yesterday, @tomorrow
 *
 * @param input - Temporal literal string (with or without @ prefix)
 * @param options - Parsing options
 * @returns Parsed temporal value
 *
 * @example
 * ```typescript
 * parseTemporalLiteral("@2024-01-15")        // Specific date
 * parseTemporalLiteral("@now")               // Current time
 * parseTemporalLiteral("@now-7d")            // 7 days ago
 * parseTemporalLiteral("@now+2w")            // 2 weeks from now
 * parseTemporalLiteral("@today")             // Start of today
 * ```
 */
export function parseTemporalLiteral(
  input: string,
  options: TemporalOptions = {}
): TemporalValue {
  const original = input;

  // Remove @ prefix if present
  if (input.startsWith(TEMPORAL_PREFIX)) {
    input = input.substring(1);
  }

  input = input.trim();

  if (!input) {
    throw new Error('Empty temporal literal');
  }

  const referenceTime = options.referenceTime
    ? new Date(options.referenceTime)
    : new Date();

  // Try parsing different formats
  let result: TemporalValue | null = null;

  // Named dates
  result = parseNamedDate(input, referenceTime, options);
  if (result) return { ...result, original };

  // Relative expressions (now, now-7d, etc.)
  result = parseRelativeExpression(input, referenceTime, options);
  if (result) return { ...result, original };

  // ISO 8601 date/datetime
  result = parseISODate(input, options);
  if (result) return { ...result, original };

  throw new Error(`Unable to parse temporal literal: ${original}`);
}

/**
 * Parse named dates (today, yesterday, tomorrow, etc.)
 */
function parseNamedDate(
  input: string,
  reference: Date,
  options: TemporalOptions
): TemporalValue | null {
  const lower = input.toLowerCase();
  let date: Date;

  switch (lower) {
    case 'now':
      date = new Date(reference);
      return createTemporalValue(date, true);

    case 'today':
      date = startOfDay(reference);
      return createTemporalValue(date, true);

    case 'yesterday':
      date = startOfDay(reference);
      date.setDate(date.getDate() - 1);
      return createTemporalValue(date, true);

    case 'tomorrow':
      date = startOfDay(reference);
      date.setDate(date.getDate() + 1);
      return createTemporalValue(date, true);

    case 'startofweek':
    case 'start-of-week':
      date = startOfWeek(reference);
      return createTemporalValue(date, true);

    case 'endofweek':
    case 'end-of-week':
      date = endOfWeek(reference);
      return createTemporalValue(date, true);

    case 'startofmonth':
    case 'start-of-month':
      date = startOfMonth(reference);
      return createTemporalValue(date, true);

    case 'endofmonth':
    case 'end-of-month':
      date = endOfMonth(reference);
      return createTemporalValue(date, true);

    case 'startofyear':
    case 'start-of-year':
      date = startOfYear(reference);
      return createTemporalValue(date, true);

    case 'endofyear':
    case 'end-of-year':
      date = endOfYear(reference);
      return createTemporalValue(date, true);

    default:
      return null;
  }
}

/**
 * Parse relative time expressions (now-7d, now+2w, etc.)
 */
function parseRelativeExpression(
  input: string,
  reference: Date,
  options: TemporalOptions
): TemporalValue | null {
  // Pattern: now[+-]<number><unit>
  const relativePattern = /^now\s*([+-])\s*(\d+)\s*([a-zA-Z]+)$/i;
  const match = input.match(relativePattern);

  if (!match) return null;

  const [, sign, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);
  const multiplier = sign === '-' ? -1 : 1;

  // Security check
  if (amount > 10000) {
    throw new SecurityError('Temporal offset too large', {
      amount,
      maxAllowed: 10000
    });
  }

  const date = new Date(reference);

  // Note: unit comparison is case-sensitive for M (month) vs m (minute)
  const normalizedUnit = unit.length === 1 ? unit : unit.toLowerCase();

  switch (normalizedUnit) {
    case 's':
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds':
      date.setSeconds(date.getSeconds() + amount * multiplier);
      break;

    case 'm':
    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes':
      date.setMinutes(date.getMinutes() + amount * multiplier);
      break;

    case 'h':
    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours':
      date.setHours(date.getHours() + amount * multiplier);
      break;

    case 'd':
    case 'day':
    case 'days':
      date.setDate(date.getDate() + amount * multiplier);
      break;

    case 'w':
    case 'wk':
    case 'wks':
    case 'week':
    case 'weeks':
      date.setDate(date.getDate() + amount * multiplier * 7);
      break;

    case 'M':
    case 'mo':
    case 'mos':
    case 'month':
    case 'months':
      date.setMonth(date.getMonth() + amount * multiplier);
      break;

    case 'y':
    case 'yr':
    case 'yrs':
    case 'year':
    case 'years':
      date.setFullYear(date.getFullYear() + amount * multiplier);
      break;

    default:
      return null;
  }

  return createTemporalValue(date, true);
}

/**
 * Parse ISO 8601 date/datetime string
 */
function parseISODate(
  input: string,
  options: TemporalOptions
): TemporalValue | null {
  // ISO 8601 patterns
  const patterns = [
    // Full ISO datetime with timezone
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(?:Z|([+-]\d{2}):?(\d{2}))$/,
    // ISO datetime without timezone
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/,
    // ISO datetime without seconds
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
    // ISO date only
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // Year-month only
    /^(\d{4})-(\d{2})$/,
    // Year only
    /^(\d{4})$/
  ];

  for (const pattern of patterns) {
    if (pattern.test(input)) {
      const date = new Date(input);

      if (!isNaN(date.getTime())) {
        // Apply startOfDay for date-only values
        if (options.startOfDay !== false && !input.includes('T')) {
          return createTemporalValue(startOfDay(date), false);
        }
        return createTemporalValue(date, false);
      }
    }
  }

  // Try native Date parsing as fallback
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    return createTemporalValue(date, false);
  }

  return null;
}

/**
 * Create a TemporalValue from a Date
 */
function createTemporalValue(date: Date, isRelative: boolean): TemporalValue {
  const timestamp = date.getTime();

  // Security: Validate timestamp range
  if (timestamp > MAX_TIMESTAMP || timestamp < -MAX_TIMESTAMP) {
    throw new SecurityError('Timestamp out of valid range', {
      timestamp,
      maxTimestamp: MAX_TIMESTAMP
    });
  }

  return {
    timestamp,
    date,
    iso: date.toISOString(),
    original: '',
    isRelative
  };
}

// ========================================
// Duration Parsing
// ========================================

/**
 * Parse ISO 8601 duration string
 *
 * @param input - Duration string (e.g., "P1Y2M3D", "PT1H30M")
 * @returns Parsed duration value
 *
 * @example
 * ```typescript
 * parseDuration("P1Y")        // 1 year
 * parseDuration("P1M")        // 1 month
 * parseDuration("P1D")        // 1 day
 * parseDuration("PT1H")       // 1 hour
 * parseDuration("PT1H30M")    // 1 hour 30 minutes
 * parseDuration("P1Y2M3DT4H5M6S")  // Full duration
 * ```
 */
export function parseDuration(input: string): DurationValue {
  // Remove @ prefix if present
  if (input.startsWith(TEMPORAL_PREFIX)) {
    input = input.substring(1);
  }

  input = input.trim().toUpperCase();

  if (!input.startsWith('P')) {
    throw new Error(`Invalid duration format: ${input}`);
  }

  const duration: DurationValue = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  };

  // Split into date and time parts
  const [datePart, timePart] = input.substring(1).split('T');

  // Parse date part (P<n>Y<n>M<n>W<n>D)
  if (datePart) {
    const datePattern = /(\d+)([YMWD])/g;
    let match;

    while ((match = datePattern.exec(datePart)) !== null) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      switch (unit) {
        case 'Y': duration.years = value; break;
        case 'M': duration.months = value; break;
        case 'W': duration.weeks = value; break;
        case 'D': duration.days = value; break;
      }
    }
  }

  // Parse time part (T<n>H<n>M<n>S)
  if (timePart) {
    const timePattern = /(\d+(?:\.\d+)?)([HMS])/g;
    let match;

    while ((match = timePattern.exec(timePart)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'H': duration.hours = value; break;
        case 'M': duration.minutes = value; break;
        case 'S':
          duration.seconds = Math.floor(value);
          duration.milliseconds = Math.round((value % 1) * 1000);
          break;
      }
    }
  }

  return duration;
}

/**
 * Convert duration to milliseconds
 *
 * Note: Months and years are approximate (30 days, 365 days)
 */
export function durationToMilliseconds(duration: DurationValue): number {
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_WEEK = 7 * MS_PER_DAY;
  const MS_PER_MONTH = 30 * MS_PER_DAY; // Approximate
  const MS_PER_YEAR = 365 * MS_PER_DAY; // Approximate

  return (
    duration.milliseconds +
    duration.seconds * MS_PER_SECOND +
    duration.minutes * MS_PER_MINUTE +
    duration.hours * MS_PER_HOUR +
    duration.days * MS_PER_DAY +
    duration.weeks * MS_PER_WEEK +
    duration.months * MS_PER_MONTH +
    duration.years * MS_PER_YEAR
  );
}

/**
 * Add duration to a date
 */
export function addDuration(date: Date, duration: DurationValue): Date {
  const result = new Date(date);

  result.setFullYear(result.getFullYear() + duration.years);
  result.setMonth(result.getMonth() + duration.months);
  result.setDate(result.getDate() + duration.weeks * 7 + duration.days);
  result.setHours(result.getHours() + duration.hours);
  result.setMinutes(result.getMinutes() + duration.minutes);
  result.setSeconds(result.getSeconds() + duration.seconds);
  result.setMilliseconds(result.getMilliseconds() + duration.milliseconds);

  return result;
}

/**
 * Subtract duration from a date
 */
export function subtractDuration(date: Date, duration: DurationValue): Date {
  const result = new Date(date);

  result.setFullYear(result.getFullYear() - duration.years);
  result.setMonth(result.getMonth() - duration.months);
  result.setDate(result.getDate() - duration.weeks * 7 - duration.days);
  result.setHours(result.getHours() - duration.hours);
  result.setMinutes(result.getMinutes() - duration.minutes);
  result.setSeconds(result.getSeconds() - duration.seconds);
  result.setMilliseconds(result.getMilliseconds() - duration.milliseconds);

  return result;
}

// ========================================
// Date Utility Functions
// ========================================

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week (Monday)
 */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of week (Sunday)
 */
export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of year
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of year
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

// ========================================
// Temporal Comparison Functions
// ========================================

/**
 * Parse a value as temporal (Date, number timestamp, or string)
 */
export function toTemporalValue(
  value: any,
  options: TemporalOptions = {}
): TemporalValue | null {
  if (value === null || value === undefined) {
    return null;
  }

  // Already a TemporalValue
  if (typeof value === 'object' && 'timestamp' in value && 'date' in value) {
    return value as TemporalValue;
  }

  // Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return createTemporalValue(value, false);
  }

  // Number (timestamp)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return createTemporalValue(new Date(value), false);
  }

  // String
  if (typeof value === 'string') {
    try {
      return parseTemporalLiteral(value, options);
    } catch {
      // Try parsing as regular date string
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return createTemporalValue(date, false);
      }
      return null;
    }
  }

  return null;
}

/**
 * Compare two temporal values
 *
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function compareTemporalValues(
  a: TemporalValue,
  b: TemporalValue
): number {
  return a.timestamp - b.timestamp;
}

/**
 * Check if date A is before date B
 */
export function isBefore(
  a: any,
  b: any,
  options: TemporalOptions = {}
): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  return tempA.timestamp < tempB.timestamp;
}

/**
 * Check if date A is after date B
 */
export function isAfter(
  a: any,
  b: any,
  options: TemporalOptions = {}
): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  return tempA.timestamp > tempB.timestamp;
}

/**
 * Check if date is between two dates (inclusive)
 */
export function isBetween(
  date: any,
  start: any,
  end: any,
  options: TemporalOptions = {}
): boolean {
  const tempDate = toTemporalValue(date, options);
  const tempStart = toTemporalValue(start, options);
  const tempEnd = toTemporalValue(end, options);

  if (!tempDate || !tempStart || !tempEnd) return false;

  return (
    tempDate.timestamp >= tempStart.timestamp &&
    tempDate.timestamp <= tempEnd.timestamp
  );
}

/**
 * Check if date is within N days ago
 */
export function isDaysAgo(
  date: any,
  days: number,
  options: TemporalOptions = {}
): boolean {
  const tempDate = toTemporalValue(date, options);
  if (!tempDate) return false;

  const reference = options.referenceTime
    ? new Date(options.referenceTime)
    : new Date();

  const daysAgoDate = new Date(reference);
  daysAgoDate.setDate(daysAgoDate.getDate() - days);

  return tempDate.timestamp >= daysAgoDate.getTime();
}

/**
 * Check if date is within N weeks ago
 */
export function isWeeksAgo(
  date: any,
  weeks: number,
  options: TemporalOptions = {}
): boolean {
  return isDaysAgo(date, weeks * 7, options);
}

/**
 * Check if date is within N months ago
 */
export function isMonthsAgo(
  date: any,
  months: number,
  options: TemporalOptions = {}
): boolean {
  const tempDate = toTemporalValue(date, options);
  if (!tempDate) return false;

  const reference = options.referenceTime
    ? new Date(options.referenceTime)
    : new Date();

  const monthsAgoDate = new Date(reference);
  monthsAgoDate.setMonth(monthsAgoDate.getMonth() - months);

  return tempDate.timestamp >= monthsAgoDate.getTime();
}

/**
 * Check if date is within N years ago
 */
export function isYearsAgo(
  date: any,
  years: number,
  options: TemporalOptions = {}
): boolean {
  const tempDate = toTemporalValue(date, options);
  if (!tempDate) return false;

  const reference = options.referenceTime
    ? new Date(options.referenceTime)
    : new Date();

  const yearsAgoDate = new Date(reference);
  yearsAgoDate.setFullYear(yearsAgoDate.getFullYear() - years);

  return tempDate.timestamp >= yearsAgoDate.getTime();
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(a: any, b: any, options: TemporalOptions = {}): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  return (
    tempA.date.getFullYear() === tempB.date.getFullYear() &&
    tempA.date.getMonth() === tempB.date.getMonth() &&
    tempA.date.getDate() === tempB.date.getDate()
  );
}

/**
 * Check if two dates are in the same week
 */
export function isSameWeek(a: any, b: any, options: TemporalOptions = {}): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  const weekA = startOfWeek(tempA.date).getTime();
  const weekB = startOfWeek(tempB.date).getTime();

  return weekA === weekB;
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(a: any, b: any, options: TemporalOptions = {}): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  return (
    tempA.date.getFullYear() === tempB.date.getFullYear() &&
    tempA.date.getMonth() === tempB.date.getMonth()
  );
}

/**
 * Check if two dates are in the same year
 */
export function isSameYear(a: any, b: any, options: TemporalOptions = {}): boolean {
  const tempA = toTemporalValue(a, options);
  const tempB = toTemporalValue(b, options);

  if (!tempA || !tempB) return false;

  return tempA.date.getFullYear() === tempB.date.getFullYear();
}

// ========================================
// Query Integration Functions
// ========================================

/**
 * Evaluate temporal operator in filter expression
 *
 * Used internally by filter-evaluator.ts
 *
 * @param operator - Temporal operator type
 * @param left - Left operand (date value from document)
 * @param right - Right operand (temporal literal or date)
 * @param extra - Extra argument (for between operator)
 * @returns Boolean result
 */
export function evaluateTemporalOperator(
  operator: string,
  left: any,
  right: any,
  extra?: any
): boolean {
  switch (operator) {
    case 'before':
      return isBefore(left, right);

    case 'after':
      return isAfter(left, right);

    case 'between':
      return isBetween(left, right, extra);

    case 'daysAgo':
      return isDaysAgo(left, typeof right === 'number' ? right : parseInt(right, 10));

    case 'weeksAgo':
      return isWeeksAgo(left, typeof right === 'number' ? right : parseInt(right, 10));

    case 'monthsAgo':
      return isMonthsAgo(left, typeof right === 'number' ? right : parseInt(right, 10));

    case 'yearsAgo':
      return isYearsAgo(left, typeof right === 'number' ? right : parseInt(right, 10));

    case 'sameDay':
      return isSameDay(left, right);

    case 'sameWeek':
      return isSameWeek(left, right);

    case 'sameMonth':
      return isSameMonth(left, right);

    case 'sameYear':
      return isSameYear(left, right);

    default:
      return false;
  }
}

/**
 * Check if an operator is a temporal operator
 */
export function isTemporalOperator(operator: string): boolean {
  const temporalOperators = [
    'before',
    'after',
    'between',
    'daysAgo',
    'weeksAgo',
    'monthsAgo',
    'yearsAgo',
    'sameDay',
    'sameWeek',
    'sameMonth',
    'sameYear'
  ];

  return temporalOperators.includes(operator);
}

/**
 * Check if a string looks like a temporal literal
 */
export function isTemporalLiteral(value: string): boolean {
  if (!value.startsWith(TEMPORAL_PREFIX)) {
    return false;
  }

  const content = value.substring(1).trim().toLowerCase();

  // Named dates
  if (['now', 'today', 'yesterday', 'tomorrow'].includes(content)) {
    return true;
  }

  // Relative expressions
  if (/^now[+-]\d+[a-z]+$/i.test(content)) {
    return true;
  }

  // ISO date patterns
  if (/^\d{4}(-\d{2})?(-\d{2})?(T\d{2}:\d{2})?/.test(content)) {
    return true;
  }

  // Duration
  if (/^P\d/.test(content.toUpperCase())) {
    return true;
  }

  return false;
}
