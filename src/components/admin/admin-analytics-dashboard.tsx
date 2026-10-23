"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  LoaderCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDayLabel } from "@/lib/analytics";
import { formatMoney } from "@/lib/utils";
import type { AdminAnalytics } from "@/types";

const ranges = [7, 30, 90] as const;

export function AdminAnalyticsDashboard({ name }: { name: string }) {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (range: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/analytics?days=${range}`);
      const payload = (await response.json()) as AdminAnalytics | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Unable to load analytics");
      }
      setData(payload as AdminAnalytics);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load analytics";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(days);
  }, [days, loadData]);

  const totals = data?.totals;
  const stats = [
    {
      label: "Total users",
      value: totals?.users,
      detail: "Accounts across all roles",
      icon: Users,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      label: "Students",
      value: totals?.students,
      detail: "Registered learners",
      icon: GraduationCap,
      iconClass: "bg-violet-50 text-violet-700",
    },
    {
      label: "Instructors",
      value: totals?.instructors,
      detail: "Teaching accounts",
      icon: Users,
      iconClass: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Active users",
      value: totals?.activeUsers,
      detail: `Active in the last ${days} days`,
      icon: Activity,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Courses",
      value: totals?.courses,
      detail: `${totals?.publishedCourses ?? 0} published`,
      icon: BookOpen,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Enrollments",
      value: totals?.enrollments,
      detail: "Across all courses",
      icon: ClipboardCheck,
      iconClass: "bg-sky-50 text-sky-700",
    },
    {
      label: "Completion rate",
      value: totals ? `${totals.completionRate}%` : undefined,
      detail: "Completed enrollments",
      icon: CheckCircle2,
      iconClass: "bg-teal-50 text-teal-700",
    },
    {
      label: "Simulated revenue",
      value: totals ? formatMoney(totals.revenue) : undefined,
      detail: "Based on current course prices",
      icon: CircleDollarSign,
      iconClass: "bg-green-50 text-green-700",
    },
    {
      label: "Pending grading",
      value: totals?.pendingGrading,
      detail: "Submissions awaiting review",
      icon: ClipboardCheck,
      iconClass: "bg-orange-50 text-orange-700",
    },
    {
      label: "AI questions",
      value: totals?.aiQuestions,
      detail: `Asked in the last ${days} days`,
      icon: Activity,
      iconClass: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Suspended accounts",
      value: totals?.suspended,
      detail: "Access currently disabled",
      icon: ShieldCheck,
      iconClass: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Platform overview
          </div>
          <div>
            <p className="text-sm text-slate-500">Welcome back, {name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Platform analytics
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              A clear view of learning activity and platform performance.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-xs font-medium text-slate-500">
            Analytics period
          </span>
          <div
            className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
            aria-label="Analytics date range"
          >
            {ranges.map((range) => (
              <Button
                key={range}
                size="sm"
                variant={range === days ? "default" : "ghost"}
                className={
                  range === days
                    ? "rounded-lg px-4 shadow-sm"
                    : "rounded-lg px-4 text-slate-600"
                }
                onClick={() => setDays(range)}
                aria-pressed={range === days}
              >
                {range} days
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex min-h-64 items-center justify-center" role="status">
          <LoaderCircle className="size-6 animate-spin" aria-label="Loading analytics" />
        </div>
      ) : (
        <>
          <section aria-label="Platform key metrics">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  At a glance
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Key measures for your learning platform.
                </p>
              </div>
              <span className="hidden text-xs text-slate-500 sm:inline">
                Activity windows use UTC
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, detail, icon: Icon, iconClass }) => (
                <Card
                  key={label}
                  className="rounded-2xl border border-slate-200/80 bg-white py-0 shadow-sm shadow-slate-200/60 ring-0 transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pt-5 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      {label}
                    </CardTitle>
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                    >
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <p className="text-3xl font-bold tracking-tight text-slate-950">
                      {value ?? "—"}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">{detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {data && (
            <>
              <section className="space-y-4" aria-label="Daily platform analytics">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Trends over time
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Daily platform activity for the selected period.
                  </p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Chart
                    title="Enrollments and signups"
                    data={data.series}
                    keys={["enrollments", "signups"]}
                  />
                  <Chart
                    title="Daily active users"
                    data={data.series}
                    keys={["activeUsers"]}
                  />
                  <Chart
                    title="Simulated revenue"
                    data={data.series}
                    keys={["revenue"]}
                    currency
                  />
                </div>
              </section>

              <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 ring-0">
                <CardHeader className="border-b border-slate-100 px-6 py-5">
                  <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
                    Top courses by enrollment
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Enrollment, completion, and simulated revenue by course.
                  </p>
                </CardHeader>
                <CardContent className="px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wide text-slate-500">
                        <tr className="border-b border-slate-100">
                          <th className="px-3 py-3 font-semibold">Course</th>
                          <th className="px-3 py-3 font-semibold">Instructor</th>
                          <th className="px-3 py-3 font-semibold">Enrollments</th>
                          <th className="px-3 py-3 font-semibold">Completion</th>
                          <th className="px-3 py-3 font-semibold">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topCourses.map((course) => (
                          <tr
                            key={course.id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-3.5 font-semibold text-slate-900">
                              {course.title}
                            </td>
                            <td className="px-3 py-3.5 text-slate-600">
                              {course.instructorName}
                            </td>
                            <td className="px-3 py-3.5 tabular-nums text-slate-700">
                              {course.enrollments}
                            </td>
                            <td className="px-3 py-3.5 tabular-nums text-slate-700">
                              {course.completionRate}%
                            </td>
                            <td className="px-3 py-3.5 font-medium tabular-nums text-slate-900">
                              {formatMoney(course.revenue)}
                            </td>
                          </tr>
                        ))}
                        {data.topCourses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                              No courses to display yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 ring-0">
                <CardHeader className="px-6 pt-6 pb-2">
                  <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
                    Course completion rates
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Share of enrollments completed for top courses.
                  </p>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {data.topCourses.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">
                      No courses to display yet.
                    </p>
                  ) : (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.topCourses}
                          layout="vertical"
                          margin={{ top: 4, right: 20, bottom: 4, left: 16 }}
                        >
                          <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            className="stroke-border"
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(value: number) => `${value}%`}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis
                            type="category"
                            dataKey="title"
                            width={160}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Completion rate"]}
                          />
                          <Bar
                            dataKey="completionRate"
                            name="Completion rate"
                            fill="hsl(var(--primary))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

type ChartProps = {
  title: string;
  data: AdminAnalytics["series"];
  keys: (keyof AdminAnalytics["series"][number])[];
  currency?: boolean;
};

function Chart({ title, data, keys, currency = false }: ChartProps) {
  return (
    <Card className="min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 ring-0">
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle className="text-sm font-semibold text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              minTickGap={24}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              width={currency ? 62 : 38}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value: number) =>
                currency ? `$${value.toLocaleString()}` : value.toString()
              }
            />
            <Tooltip
              labelFormatter={(value) => formatDayLabel(String(value))}
              formatter={(value, key) => [
                currency ? formatMoney(Number(value)) : value,
                key,
              ]}
            />
            {keys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={String(key).replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}
                stroke={[
                  "hsl(var(--primary))",
                  "hsl(var(--secondary-foreground))",
                ][index % 2]}
                fill={[
                  "hsl(var(--primary))",
                  "hsl(var(--secondary-foreground))",
                ][index % 2]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
