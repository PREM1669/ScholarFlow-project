export type ActivityEvent = { userId: string; date: Date };

const DAY_MS = 86_400_000;

export const dayKey = (date: Date) => date.toISOString().slice(0, 10);

export function lastNDays(n: number, now: Date = new Date()): string[] {
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Array.from({ length: n }, (_, index) =>
    dayKey(new Date(todayUtc - (n - 1 - index) * DAY_MS)),
  );
}

export const windowStart = (days: string[]) =>
  new Date(`${days[0]}T00:00:00.000Z`);

function indexByDay(days: string[]) {
  return new Map<string, number>(
    days.map((day, index) => [day, index] as [string, number]),
  );
}

export function countPerDay(dates: Date[], days: string[]): number[] {
  const index = indexByDay(days);
  const output = days.map(() => 0);
  for (const date of dates) {
    const dayIndex = index.get(dayKey(date));
    if (dayIndex !== undefined) output[dayIndex] += 1;
  }
  return output;
}

export function sumPerDay(
  items: { date: Date; value: number }[],
  days: string[],
): number[] {
  const index = indexByDay(days);
  const output = days.map(() => 0);
  for (const item of items) {
    const dayIndex = index.get(dayKey(item.date));
    if (dayIndex !== undefined) output[dayIndex] += item.value;
  }
  return output;
}

export function distinctUsersPerDay(
  events: ActivityEvent[],
  days: string[],
): number[] {
  const index = indexByDay(days);
  const usersPerDay = days.map(() => new Set<string>());
  for (const event of events) {
    const dayIndex = index.get(dayKey(event.date));
    if (dayIndex !== undefined) usersPerDay[dayIndex].add(event.userId);
  }
  return usersPerDay.map((users) => users.size);
}

export const distinctUsers = (events: ActivityEvent[]) =>
  new Set(events.map((event) => event.userId)).size;

export const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;

export function formatDayLabel(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
