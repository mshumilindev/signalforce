import type { Weekday } from '@/features/preferences/types';
import type { DigestCadenceInput, DigestWindow } from '@/features/digest/types';
import {
  addDaysInTimezone,
  addMonthsInTimezone,
  createDateInTimezone,
  getZonedFields,
  parsePreferredTime,
  toIsoString,
  weekdayToJsDay,
  type ZonedDateTimeFields,
} from '@/features/digest/timezone';

function withPreferredTime(
  timezone: string,
  fields: ZonedDateTimeFields,
  preferredTime: string,
): Date {
  const { hour, minute } = parsePreferredTime(preferredTime);

  return createDateInTimezone(timezone, {
    ...fields,
    hour,
    minute,
  });
}

function findLatestWeekdayAnchor(
  timezone: string,
  referenceDate: Date,
  weekday: Weekday,
  preferredTime: string,
): Date {
  const referenceFields = getZonedFields(referenceDate, timezone);
  const { hour, minute } = parsePreferredTime(preferredTime);
  let candidateFields: ZonedDateTimeFields = {
    year: referenceFields.year,
    month: referenceFields.month,
    day: referenceFields.day,
    hour,
    minute,
  };

  const referenceJsDay = weekdayToJsDay(referenceFields.weekday);
  const targetJsDay = weekdayToJsDay(weekday);
  const dayOffset = (referenceJsDay - targetJsDay + 7) % 7;

  candidateFields = addDaysInTimezone(timezone, candidateFields, -dayOffset);
  let candidate = createDateInTimezone(timezone, candidateFields);

  if (candidate.getTime() > referenceDate.getTime()) {
    candidateFields = addDaysInTimezone(timezone, candidateFields, -7);
    candidate = createDateInTimezone(timezone, candidateFields);
  }

  return candidate;
}

function findLatestTwicePerWeekAnchor(
  timezone: string,
  referenceDate: Date,
  weekday: Weekday,
  preferredTime: string,
): Date {
  const secondWeekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    (weekdayToJsDay(weekday) + 3) % 7
  ] as Weekday;

  const firstAnchor = findLatestWeekdayAnchor(timezone, referenceDate, weekday, preferredTime);
  const secondAnchor = findLatestWeekdayAnchor(timezone, referenceDate, secondWeekday, preferredTime);

  return firstAnchor.getTime() >= secondAnchor.getTime() ? firstAnchor : secondAnchor;
}

function findLatestMonthlyAnchor(
  timezone: string,
  referenceDate: Date,
  weekday: Weekday,
  preferredTime: string,
): Date {
  const referenceFields = getZonedFields(referenceDate, timezone);
  const { hour, minute } = parsePreferredTime(preferredTime);

  let monthFields: ZonedDateTimeFields = {
    year: referenceFields.year,
    month: referenceFields.month,
    day: 1,
    hour,
    minute,
  };

  let anchor = findLatestWeekdayAnchor(
    timezone,
    withPreferredTime(timezone, monthFields, preferredTime),
    weekday,
    preferredTime,
  );

  if (anchor.getTime() > referenceDate.getTime()) {
    monthFields = addMonthsInTimezone(timezone, monthFields, -1);
    anchor = findLatestWeekdayAnchor(
      timezone,
      withPreferredTime(timezone, monthFields, preferredTime),
      weekday,
      preferredTime,
    );
  }

  return anchor;
}

function findLatestDailyAnchor(timezone: string, referenceDate: Date, preferredTime: string): Date {
  const referenceFields = getZonedFields(referenceDate, timezone);
  const { hour, minute } = parsePreferredTime(preferredTime);
  let anchorFields: ZonedDateTimeFields = {
    year: referenceFields.year,
    month: referenceFields.month,
    day: referenceFields.day,
    hour,
    minute,
  };
  let anchor = createDateInTimezone(timezone, anchorFields);

  if (anchor.getTime() > referenceDate.getTime()) {
    anchorFields = addDaysInTimezone(timezone, anchorFields, -1);
    anchor = createDateInTimezone(timezone, anchorFields);
  }

  return anchor;
}

function findPeriodEndAnchor(cadence: DigestCadenceInput, referenceDate: Date): Date {
  const { frequency, timezone, preferredWeekday, preferredTime } = cadence;

  if (frequency === 'daily') {
    return findLatestDailyAnchor(timezone, referenceDate, preferredTime);
  }

  if (!preferredWeekday) {
    throw new Error('Preferred weekday is required for this digest frequency.');
  }

  if (frequency === 'weekly' || frequency === 'biweekly') {
    return findLatestWeekdayAnchor(timezone, referenceDate, preferredWeekday, preferredTime);
  }

  if (frequency === 'twicePerWeek') {
    return findLatestTwicePerWeekAnchor(timezone, referenceDate, preferredWeekday, preferredTime);
  }

  return findLatestMonthlyAnchor(timezone, referenceDate, preferredWeekday, preferredTime);
}

function periodSpanDays(frequency: DigestCadenceInput['frequency']): number {
  if (frequency === 'daily') return 1;
  if (frequency === 'twicePerWeek') return 3;
  if (frequency === 'weekly') return 7;
  if (frequency === 'biweekly') return 14;
  return 0;
}

function calculatePeriodStart(cadence: DigestCadenceInput, periodEnd: Date): Date {
  const periodEndFields = getZonedFields(periodEnd, cadence.timezone);
  const spanDays = periodSpanDays(cadence.frequency);

  if (spanDays > 0) {
    return createDateInTimezone(
      cadence.timezone,
      addDaysInTimezone(cadence.timezone, periodEndFields, -spanDays),
    );
  }

  return createDateInTimezone(
    cadence.timezone,
    addMonthsInTimezone(cadence.timezone, periodEndFields, -1),
  );
}

function calculateExpiresAt(cadence: DigestCadenceInput, periodEnd: Date): Date {
  const periodEndFields = getZonedFields(periodEnd, cadence.timezone);
  const spanDays = periodSpanDays(cadence.frequency);

  if (spanDays > 0) {
    return createDateInTimezone(
      cadence.timezone,
      addDaysInTimezone(cadence.timezone, periodEndFields, spanDays),
    );
  }

  if (!cadence.preferredWeekday) {
    throw new Error('Preferred weekday is required for monthly digests.');
  }

  const nextMonthFields = addMonthsInTimezone(cadence.timezone, periodEndFields, 1);
  return findLatestWeekdayAnchor(
    cadence.timezone,
    withPreferredTime(cadence.timezone, nextMonthFields, cadence.preferredTime),
    cadence.preferredWeekday,
    cadence.preferredTime,
  );
}

export function calculateDigestWindow(
  cadence: DigestCadenceInput,
  referenceDate: Date,
): DigestWindow {
  const periodEnd = findPeriodEndAnchor(cadence, referenceDate);
  const periodStart = calculatePeriodStart(cadence, periodEnd);
  const expiresAt = calculateExpiresAt(cadence, periodEnd);

  return {
    periodStart: toIsoString(periodStart),
    periodEnd: toIsoString(periodEnd),
    expiresAt: toIsoString(expiresAt),
  };
}

export function calculateNextDigestDueAt(window: DigestWindow): string {
  return window.expiresAt;
}
