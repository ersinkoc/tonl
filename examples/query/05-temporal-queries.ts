/**
 * TONL Query API - Temporal Query Examples
 *
 * This example demonstrates temporal query capabilities added in v2.4.0:
 * - Named date literals (@now, @today, @yesterday, @tomorrow)
 * - Relative time expressions (@now-7d, @now+1w, @now-3M)
 * - ISO 8601 date literals (@2025-01-15)
 * - Date comparison operators (before, after, between)
 * - Relative checks (daysAgo, weeksAgo, monthsAgo, yearsAgo)
 * - Calendar period matching (sameDay, sameWeek, sameMonth, sameYear)
 */

import { TONLDocument } from '../../dist/index.js';
import {
  parseTemporalLiteral,
  parseDuration,
  durationToMilliseconds,
  addDuration,
  subtractDuration,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  toTemporalValue,
  isBefore,
  isAfter,
  isBetween,
  isDaysAgo,
  isWeeksAgo,
  isMonthsAgo,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear
} from '../../dist/query/temporal-evaluator.js';

console.log('=== TONL Query API - Temporal Queries (v2.4.0) ===\n');

// ============================================
// 1. NAMED DATE LITERALS
// ============================================
console.log('1. NAMED DATE LITERALS');
console.log('─'.repeat(50));

const now = parseTemporalLiteral('@now');
const today = parseTemporalLiteral('@today');
const yesterday = parseTemporalLiteral('@yesterday');
const tomorrow = parseTemporalLiteral('@tomorrow');

console.log(`\n   @now:       ${new Date(now.timestamp).toISOString()}`);
console.log(`   @today:     ${new Date(today.timestamp).toISOString().split('T')[0]}`);
console.log(`   @yesterday: ${new Date(yesterday.timestamp).toISOString().split('T')[0]}`);
console.log(`   @tomorrow:  ${new Date(tomorrow.timestamp).toISOString().split('T')[0]}`);

// ============================================
// 2. RELATIVE TIME EXPRESSIONS
// ============================================
console.log('\n\n2. RELATIVE TIME EXPRESSIONS');
console.log('─'.repeat(50));
console.log('   Format: @now±{amount}{unit}');
console.log('   Units: s(seconds), m(minutes), h(hours), d(days), w(weeks), M(months), y(years)\n');

const relativeExamples = [
  '@now-30s',   // 30 seconds ago
  '@now-5m',    // 5 minutes ago
  '@now-2h',    // 2 hours ago
  '@now-1d',    // 1 day ago
  '@now-7d',    // 7 days ago
  '@now-1w',    // 1 week ago
  '@now-1M',    // 1 month ago
  '@now-1y',    // 1 year ago
  '@now+1d',    // 1 day from now
  '@now+1w',    // 1 week from now
];

console.log('   Expression      Resolved Date');
console.log('   ─────────────────────────────────────────────');
for (const expr of relativeExamples) {
  const result = parseTemporalLiteral(expr);
  const dateStr = new Date(result.timestamp).toISOString().slice(0, 19).replace('T', ' ');
  console.log(`   ${expr.padEnd(14)} ${dateStr}`);
}

// ============================================
// 3. ISO 8601 DATE LITERALS
// ============================================
console.log('\n\n3. ISO 8601 DATE LITERALS');
console.log('─'.repeat(50));

const isoExamples = [
  '@2025-01-15',
  '@2025-06-30',
  '@2025-12-25',
  '@2025-01-15T10:30:00',
  '@2025-01-15T10:30:00Z'
];

console.log('\n   Literal                     Parsed Date');
console.log('   ─────────────────────────────────────────────');
for (const literal of isoExamples) {
  const result = parseTemporalLiteral(literal);
  const dateStr = new Date(result.timestamp).toISOString();
  console.log(`   ${literal.padEnd(26)} ${dateStr}`);
}

// ============================================
// 4. DURATION PARSING (ISO 8601 Format)
// ============================================
console.log('\n\n4. DURATION PARSING (ISO 8601 Format)');
console.log('─'.repeat(50));
console.log('   Format: P<n>Y<n>M<n>W<n>DT<n>H<n>M<n>S\n');

// ISO 8601 duration format examples
const isoDurations = [
  { input: 'PT30S', label: '30 seconds' },
  { input: 'PT5M', label: '5 minutes' },
  { input: 'PT2H', label: '2 hours' },
  { input: 'P1D', label: '1 day' },
  { input: 'P1W', label: '1 week' },
  { input: 'P1M', label: '1 month' },
  { input: 'P1Y', label: '1 year' }
];

console.log('   Duration       Label          Milliseconds');
console.log('   ─────────────────────────────────────────────────────');
for (const { input, label } of isoDurations) {
  const parsed = parseDuration(input);
  const ms = durationToMilliseconds(parsed);
  console.log(`   ${input.padEnd(12)} ${label.padEnd(14)} ${String(ms).padStart(15)}`);
}

// ============================================
// 5. DATE ARITHMETIC
// ============================================
console.log('\n\n5. DATE ARITHMETIC');
console.log('─'.repeat(50));

const baseDate = new Date('2025-06-15T12:00:00Z');
console.log(`\n   Base date: ${baseDate.toISOString()}`);

console.log('\n   Addition:');
console.log(`   + 1 day:   ${addDuration(baseDate, parseDuration('P1D')).toISOString()}`);
console.log(`   + 1 week:  ${addDuration(baseDate, parseDuration('P1W')).toISOString()}`);
console.log(`   + 1 month: ${addDuration(baseDate, parseDuration('P1M')).toISOString()}`);

console.log('\n   Subtraction:');
console.log(`   - 1 day:   ${subtractDuration(baseDate, parseDuration('P1D')).toISOString()}`);
console.log(`   - 1 week:  ${subtractDuration(baseDate, parseDuration('P1W')).toISOString()}`);
console.log(`   - 1 month: ${subtractDuration(baseDate, parseDuration('P1M')).toISOString()}`);

// ============================================
// 6. CALENDAR BOUNDARIES
// ============================================
console.log('\n\n6. CALENDAR BOUNDARIES');
console.log('─'.repeat(50));

const sampleDate = new Date('2025-06-15T14:30:45Z');
console.log(`\n   Sample date: ${sampleDate.toISOString()}`);

console.log('\n   Day boundaries:');
console.log(`   Start of day: ${startOfDay(sampleDate).toISOString()}`);
console.log(`   End of day:   ${endOfDay(sampleDate).toISOString()}`);

console.log('\n   Week boundaries:');
console.log(`   Start of week: ${startOfWeek(sampleDate).toISOString()}`);
console.log(`   End of week:   ${endOfWeek(sampleDate).toISOString()}`);

console.log('\n   Month boundaries:');
console.log(`   Start of month: ${startOfMonth(sampleDate).toISOString()}`);
console.log(`   End of month:   ${endOfMonth(sampleDate).toISOString()}`);

console.log('\n   Year boundaries:');
console.log(`   Start of year: ${startOfYear(sampleDate).toISOString()}`);
console.log(`   End of year:   ${endOfYear(sampleDate).toISOString()}`);

// ============================================
// 7. DATE COMPARISONS
// ============================================
console.log('\n\n7. DATE COMPARISONS');
console.log('─'.repeat(50));

const date1 = new Date('2025-01-15');
const date2 = new Date('2025-06-30');
const date3 = new Date('2025-03-15');

console.log(`\n   date1: ${date1.toISOString().split('T')[0]}`);
console.log(`   date2: ${date2.toISOString().split('T')[0]}`);
console.log(`   date3: ${date3.toISOString().split('T')[0]}`);

console.log('\n   Before/After:');
console.log(`   date1 before date2: ${isBefore(date1, date2) ? '✓' : '✗'}`);
console.log(`   date2 after date1:  ${isAfter(date2, date1) ? '✓' : '✗'}`);
console.log(`   date1 after date2:  ${isAfter(date1, date2) ? '✓' : '✗'}`);

console.log('\n   Between:');
console.log(`   date3 between date1 and date2: ${isBetween(date3, date1, date2) ? '✓' : '✗'}`);
console.log(`   date1 between date3 and date2: ${isBetween(date1, date3, date2) ? '✓' : '✗'}`);

// ============================================
// 8. RELATIVE CHECKS
// ============================================
console.log('\n\n8. RELATIVE CHECKS');
console.log('─'.repeat(50));

const daysAgoDate = new Date();
daysAgoDate.setDate(daysAgoDate.getDate() - 5);

const weeksAgoDate = new Date();
weeksAgoDate.setDate(weeksAgoDate.getDate() - 10);

const monthsAgoDate = new Date();
monthsAgoDate.setMonth(monthsAgoDate.getMonth() - 2);

console.log(`\n   5 days ago date: ${daysAgoDate.toISOString().split('T')[0]}`);
console.log(`   Was it within last 7 days?  ${isDaysAgo(daysAgoDate, 7) ? '✓' : '✗'}`);
console.log(`   Was it within last 3 days?  ${isDaysAgo(daysAgoDate, 3) ? '✓' : '✗'}`);

console.log(`\n   10 days ago date: ${weeksAgoDate.toISOString().split('T')[0]}`);
console.log(`   Was it within last 2 weeks? ${isWeeksAgo(weeksAgoDate, 2) ? '✓' : '✗'}`);
console.log(`   Was it within last 1 week?  ${isWeeksAgo(weeksAgoDate, 1) ? '✓' : '✗'}`);

console.log(`\n   2 months ago date: ${monthsAgoDate.toISOString().split('T')[0]}`);
console.log(`   Was it within last 3 months? ${isMonthsAgo(monthsAgoDate, 3) ? '✓' : '✗'}`);
console.log(`   Was it within last 1 month?  ${isMonthsAgo(monthsAgoDate, 1) ? '✓' : '✗'}`);

// ============================================
// 9. CALENDAR PERIOD MATCHING
// ============================================
console.log('\n\n9. CALENDAR PERIOD MATCHING');
console.log('─'.repeat(50));

const todayDate = new Date();
const sameDayDate = new Date(todayDate);
sameDayDate.setHours(todayDate.getHours() + 5);

const sameWeekDate = new Date(todayDate);
sameWeekDate.setDate(todayDate.getDate() + 2);

const sameMonthDate = new Date(todayDate);
sameMonthDate.setDate(15);

const sameYearDate = new Date(todayDate);
sameYearDate.setMonth(todayDate.getMonth() + 3);

console.log(`\n   Reference: ${todayDate.toISOString()}`);

console.log('\n   Same Day:');
console.log(`   ${sameDayDate.toISOString()} - same day? ${isSameDay(todayDate, sameDayDate) ? '✓' : '✗'}`);

console.log('\n   Same Week:');
console.log(`   ${sameWeekDate.toISOString().split('T')[0]} - same week? ${isSameWeek(todayDate, sameWeekDate) ? '✓' : '✗'}`);

console.log('\n   Same Month:');
console.log(`   ${sameMonthDate.toISOString().split('T')[0]} - same month? ${isSameMonth(todayDate, sameMonthDate) ? '✓' : '✗'}`);

console.log('\n   Same Year:');
console.log(`   ${sameYearDate.toISOString().split('T')[0]} - same year? ${isSameYear(todayDate, sameYearDate) ? '✓' : '✗'}`);

// ============================================
// 10. REAL-WORLD USE CASES
// ============================================
console.log('\n\n10. REAL-WORLD USE CASES');
console.log('─'.repeat(50));

// Create sample data with various dates
const now2 = new Date();
const yesterday2 = new Date(now2);
yesterday2.setDate(now2.getDate() - 1);
const lastWeek = new Date(now2);
lastWeek.setDate(now2.getDate() - 7);
const lastMonth = new Date(now2);
lastMonth.setMonth(now2.getMonth() - 1);

const eventData = {
  events: [
    { id: 1, name: 'Server Restart', timestamp: now2.toISOString(), severity: 'info' },
    { id: 2, name: 'Database Backup', timestamp: yesterday2.toISOString(), severity: 'info' },
    { id: 3, name: 'Memory Warning', timestamp: lastWeek.toISOString(), severity: 'warning' },
    { id: 4, name: 'Disk Full Alert', timestamp: lastMonth.toISOString(), severity: 'error' },
    { id: 5, name: 'New User Signup', timestamp: now2.toISOString(), severity: 'info' },
    { id: 6, name: 'Failed Login', timestamp: yesterday2.toISOString(), severity: 'warning' }
  ],
  orders: [
    { id: 101, status: 'completed', createdAt: now2.toISOString() },
    { id: 102, status: 'pending', createdAt: yesterday2.toISOString() },
    { id: 103, status: 'shipped', createdAt: lastWeek.toISOString() },
    { id: 104, status: 'completed', createdAt: lastMonth.toISOString() }
  ]
};

const doc = TONLDocument.fromJSON(eventData);

// Scenario 1: Events from today
console.log('\n   📅 Events from today:');
const allEvents = doc.query('events[*]') as any[];
const todaysEvents = allEvents.filter(e => isSameDay(new Date(e.timestamp), now2));
todaysEvents.forEach(e => console.log(`     - ${e.name} (${e.severity})`));

// Scenario 2: Events from last 7 days
console.log('\n   📅 Events from last 7 days:');
const recentEvents = allEvents.filter(e => isDaysAgo(new Date(e.timestamp), 7));
recentEvents.forEach(e => console.log(`     - ${e.name} (${new Date(e.timestamp).toISOString().split('T')[0]})`));

// Scenario 3: Filter orders by date
console.log('\n   📦 Orders from last week:');
const allOrders = doc.query('orders[*]') as any[];
const lastWeekOrders = allOrders.filter(o => isWeeksAgo(new Date(o.createdAt), 1));
lastWeekOrders.forEach(o => console.log(`     - Order #${o.id}: ${o.status}`));

// Scenario 4: Count events by time period
console.log('\n   📊 Event counts by period:');
const todayCount = allEvents.filter(e => isSameDay(new Date(e.timestamp), now2)).length;
const thisWeekCount = allEvents.filter(e => isWeeksAgo(new Date(e.timestamp), 1)).length;
const thisMonthCount = allEvents.filter(e => isMonthsAgo(new Date(e.timestamp), 1)).length;
console.log(`     Today: ${todayCount}`);
console.log(`     This week: ${thisWeekCount}`);
console.log(`     This month: ${thisMonthCount}`);

// ============================================
// 11. QUERY EXPRESSIONS (CONCEPTUAL)
// ============================================
console.log('\n\n11. TEMPORAL QUERY EXPRESSIONS');
console.log('─'.repeat(50));
console.log('   These expressions can be used in TONL queries:\n');

const queryExamples = [
  ['events[?(@.date > @now-7d)]', 'Events from last 7 days'],
  ['events[?(@.date sameDay @today)]', 'Events from today'],
  ['orders[?(@.created before @yesterday)]', 'Orders before yesterday'],
  ['orders[?(@.created after @now-1M)]', 'Orders from last month'],
  ['logs[?(@.timestamp between @now-1h and @now)]', 'Logs from last hour'],
  ['tasks[?(@.dueDate daysAgo 7)]', 'Tasks due within a week'],
  ['invoices[?(@.date sameMonth @now)]', 'Invoices from this month'],
  ['reports[?(@.generated sameYear @2025-01-01)]', 'Reports from 2025']
];

for (const [expr, desc] of queryExamples) {
  console.log(`   ${expr}`);
  console.log(`   └─ ${desc}\n`);
}

// ============================================
// 12. EDGE CASES
// ============================================
console.log('\n12. EDGE CASES');
console.log('─'.repeat(50));

console.log('\n   Year boundaries:');
const dec31 = parseTemporalLiteral('@2025-12-31');
const jan1 = parseTemporalLiteral('@2025-01-01');
console.log(`   Dec 31, 2025 before Jan 1, 2025: ${isBefore(new Date(dec31.timestamp), new Date(jan1.timestamp)) ? '✓' : '✗'}`);

console.log('\n   Leap year handling:');
const feb29 = parseTemporalLiteral('@2025-02-29');
console.log(`   Feb 29, 2025 parsed: ${new Date(feb29.timestamp).toISOString().split('T')[0]}`);

console.log('\n   Month boundary calculations:');
const jan31 = new Date('2025-01-31');
const plusMonth = addDuration(jan31, parseDuration('P1M'));
console.log(`   Jan 31 + 1 month: ${plusMonth.toISOString().split('T')[0]}`);

console.log('\n✅ All temporal query examples work perfectly!');
