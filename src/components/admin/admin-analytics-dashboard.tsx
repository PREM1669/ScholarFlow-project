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
    { label: "Total users", value: totals?.users, icon: Users },
    { label: "Students", value: totals?.students, icon: GraduationCap },
    { label: "Instructors", value: totals?.instructors, icon: Users },
    { label: "Active users", value: totals?.activeUsers, icon: Activity },
    { label: "Courses", value: totals?.courses, icon: BookOpen },
    { label: "Enrollments", value: totals?.enrollments, icon: ClipboardCheck },
    {
      label: "Completion rate",
      value: totals ? `${totals.completionRate}%` : undefined,
      icon: CheckCircle2,
    },
    {
      label: "Simulated revenue",
      value: totals ? formatMoney(totals.revenue) : undefined,
      icon: CircleDollarSign,
    },
    {
      label: "Pending grading",
      value: totals?.pendingGrading,
      icon: ClipboardCheck,
    },
    { label: "AI questions", value: totals?.aiQuestions, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {name}</p>
          <h1 className="text-3xl font-bold tracking-tight">Platform analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity and learning performance across ScholarFlow.
          </p>
        </div>
        <div className="flex gap-2" aria-label="Analytics date range">
          {ranges.map((range) => (
            <Button
              key={range}
              size="sm"
              variant={range === days ? "default" : "outline"}
              onClick={() => setDays(range)}
              aria-pressed={range === days}
            >
              {range} days
            </Button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex min-h-64 items-center justify-center" role="status">
          <LoaderCircle className="size-6 animate-spin" aria-label="Loading analytics" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{value ?? "—"}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {data && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Daily platform activity</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-8 lg:grid-cols-2">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top courses by enrollment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="p-2 font-medium">Course</th>
                          <th className="p-2 font-medium">Instructor</th>
                          <th className="p-2 font-medium">Enrollments</th>
                          <th className="p-2 font-medium">Completion</th>
                          <th className="p-2 font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topCourses.map((course) => (
                          <tr key={course.id} className="border-b last:border-0">
                            <td className="p-2 font-medium">{course.title}</td>
                            <td className="p-2">{course.instructorName}</td>
                            <td className="p-2">{course.enrollments}</td>
                            <td className="p-2">{course.completionRate}%</td>
                            <td className="p-2">{formatMoney(course.revenue)}</td>
                          </tr>
                        ))}
                        {data.topCourses.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-muted-foreground">
                              No courses to display yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course completion rates</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.topCourses.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
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
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              width={currency ? 62 : 38}
              tick={{ fontSize: 11 }}
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
    </div>
  );
}
