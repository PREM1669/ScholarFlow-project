import {
  countPerDay,
  dayKey,
  distinctUsers,
  distinctUsersPerDay,
  formatDayLabel,
  lastNDays,
  percent,
  sumPerDay,
  windowStart,
} from "@/lib/analytics";

const at = (iso: string) => new Date(iso);
const days = lastNDays(3, at("2026-10-23T15:30:00Z"));

describe("UTC date windows", () => {
  it("lists the last days oldest first and crosses month boundaries", () => {
    expect(days).toEqual(["2026-10-21", "2026-10-22", "2026-10-23"]);
    expect(lastNDays(3, at("2026-11-01T01:00:00Z"))).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
    ]);
  });

  it("starts at UTC midnight and formats UTC day labels", () => {
    expect(windowStart(days).toISOString()).toBe("2026-10-21T00:00:00.000Z");
    expect(dayKey(at("2026-10-23T23:59:59Z"))).toBe("2026-10-23");
    expect(formatDayLabel("2026-10-23")).toContain("23");
  });
});

describe("daily series builders", () => {
  it("counts events per day and ignores events outside the range", () => {
    expect(
      countPerDay(
        [
          at("2026-10-21T01:00:00Z"),
          at("2026-10-21T22:00:00Z"),
          at("2026-10-23T05:00:00Z"),
          at("2026-10-01T00:00:00Z"),
        ],
        days,
      ),
    ).toEqual([2, 0, 1]);
  });

  it("sums values per day", () => {
    expect(
      sumPerDay(
        [
          { date: at("2026-10-21T01:00:00Z"), value: 10 },
          { date: at("2026-10-21T02:00:00Z"), value: 5.5 },
          { date: at("2026-10-22T02:00:00Z"), value: 1 },
        ],
        days,
      ),
    ).toEqual([15.5, 1, 0]);
  });

  it("counts users once per day and across the full period", () => {
    const events = [
      { userId: "u1", date: at("2026-10-21T01:00:00Z") },
      { userId: "u1", date: at("2026-10-21T09:00:00Z") },
      { userId: "u2", date: at("2026-10-21T10:00:00Z") },
      { userId: "u1", date: at("2026-10-23T10:00:00Z") },
    ];
    expect(distinctUsersPerDay(events, days)).toEqual([2, 0, 1]);
    expect(distinctUsers(events)).toBe(2);
  });
});

describe("percent", () => {
  it("rounds to one decimal and handles a zero denominator", () => {
    expect(percent(1, 3)).toBe(33.3);
    expect(percent(2, 3)).toBe(66.7);
    expect(percent(0, 0)).toBe(0);
    expect(percent(2, 2)).toBe(100);
  });
});
