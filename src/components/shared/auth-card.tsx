import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="surface-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-12 size-80 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 size-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-slate-900/10 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white md:flex">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/35 via-indigo-950 to-slate-950" />
          <div className="surface-grid absolute inset-0 opacity-20" />
          <Link href="/" className="relative inline-flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <BookOpen className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">ScholarFlow</span>
          </Link>
          <div className="relative max-w-sm">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
              <Sparkles className="size-3.5" />
              Make room for progress
            </span>
            <p className="text-3xl font-semibold leading-tight tracking-tight">
              A clearer path to your next big thing.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Bring your learning and teaching into one calm, focused workspace.
            </p>
          </div>
          <p className="relative text-xs text-slate-400">
            A better way to move forward, one lesson at a time.
          </p>
        </aside>

        <section className="flex min-h-[620px] flex-col justify-center p-6 sm:p-10 lg:p-14">
          <Link
            href="/"
            className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="mb-8">
            <div className="mb-6 hidden size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex">
              <BookOpen className="size-5" />
            </div>
            <CardHeader className="p-0">
              <CardTitle className="text-3xl font-semibold tracking-tight">
                {title}
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-6">
                {description}
              </CardDescription>
            </CardHeader>
          </div>
          <Card className="border-0 bg-transparent py-0 shadow-none ring-0">
            <CardContent className="p-0">{children}</CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
