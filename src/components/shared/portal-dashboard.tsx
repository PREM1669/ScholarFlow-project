import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Role } from "@prisma/client";

type DashboardStat = {
  label: string;
  value: number;
  detail: string;
  icon: "courses" | "complete" | "users" | "activity";
};

const statIcons = {
  courses: BookOpen,
  complete: ClipboardCheck,
  users: Users,
  activity: Activity,
};

const roleContent: Record<
  Role,
  {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  STUDENT: {
    eyebrow: "STUDENT WORKSPACE",
    title: "Your learning, in one place.",
    description:
      "A little progress each day adds up. Your courses, milestones, and activity will live here.",
    emptyTitle: "Your next chapter starts here",
    emptyDescription:
      "When you join a course, it will appear here with your progress and learning activity.",
  },
  INSTRUCTOR: {
    eyebrow: "INSTRUCTOR WORKSPACE",
    title: "A clear view of your teaching.",
    description:
      "Keep your courses and learners organized, and make space for your next great lesson.",
    emptyTitle: "Your teaching space is ready",
    emptyDescription:
      "Courses you create will appear here, along with their learners and publishing status.",
  },
  ADMIN: {
    eyebrow: "ADMINISTRATOR WORKSPACE",
    title: "Your platform overview.",
    description:
      "A simple overview of ScholarFlow accounts and course activity, all in one place.",
    emptyTitle: "Your platform is ready",
    emptyDescription:
      "As the platform grows, this overview will help you keep track of users and courses.",
  },
};

export function PortalDashboard({
  name,
  role,
  stats,
}: {
  name: string;
  role: Role;
  stats: DashboardStat[];
}) {
  const content = roleContent[role];

  return (
    <div className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-indigo-950 to-slate-950" />
        <div className="surface-grid absolute inset-0 -z-10 opacity-20" />
        <div className="absolute -right-16 -top-24 -z-10 size-72 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-12 -z-10 size-48 rounded-full border border-white/10" />
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-blue-100">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.14)]" />
            {content.eyebrow}
          </div>
          <p className="mb-2 text-sm text-slate-300">
            Welcome back, <span className="font-semibold text-white">{name}</span>
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            {content.description}
          </p>
        </div>
        <div className="absolute bottom-8 right-9 hidden size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-blue-100 shadow-lg backdrop-blur-sm lg:flex">
          {role === "STUDENT" ? (
            <GraduationCap className="size-8" />
          ) : role === "INSTRUCTOR" ? (
            <Layers3 className="size-8" />
          ) : (
            <ShieldCheck className="size-8" />
          )}
        </div>
      </section>

      <section aria-label="Workspace statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return (
            <article
              key={stat.label}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md hover:shadow-blue-950/[0.05] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-indigo-600">
                YOUR SPACE
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                {content.emptyTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {content.emptyDescription}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Account in good shape</h2>
              <p className="mt-1 text-xs text-slate-500">You’re signed in and ready to go.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Workspace</span>
              <span className="font-medium text-slate-800">
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
