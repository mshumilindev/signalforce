const COMMON_TIMEZONES = [
  'UTC',
  'Europe/London',
  'Europe/Warsaw',
  'Europe/Kyiv',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Singapore',
] as const;

export function getTimezoneOptions(browserTimezone: string): readonly string[] {
  const unique = new Set<string>([browserTimezone, ...COMMON_TIMEZONES]);
  return [...unique].sort((left, right) => left.localeCompare(right));
}
