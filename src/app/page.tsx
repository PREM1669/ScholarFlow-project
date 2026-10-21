import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  GraduationCap,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="relative z-10 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
              <BookOpen className="size-[18px]" />
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900">
              ScholarFlow
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/register">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(219,234,254,0.72),_transparent_62%)]" />
        <div className="surface-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles className="size-3.5" />
              Learning, with a little more direction
            </div>
            <h1 className="text-balance text-5xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[4.25rem]">
              Make learning
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                feel effortless.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              A focused space for students to keep moving and for instructors to
              make every lesson count. Your next step starts here.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Create your account <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              {["A place for every role", "Progress that feels clear"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="size-3" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-blue-200/50 via-indigo-100/50 to-violet-200/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur-xl sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Your learning space
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Everything starts with a good next step
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                  <GraduationCap className="size-5" />
                </span>
              </div>
              <div className="space-y-3 py-5">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Learn at your pace
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Keep your courses and progress in one place.
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-slate-400" />
                </div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Layers3 className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Teach with clarity
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Bring lessons, assignments, and learners together.
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-slate-400" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      Start with one small step
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Create an account and find the tools for your role.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-5 -top-5 hidden rounded-2xl border border-white/80 bg-white p-3.5 shadow-lg shadow-slate-900/10 sm:block">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Check className="size-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} ScholarFlow. Learn with direction.</p>
          <p>Built for focused learning and thoughtful teaching.</p>
        </div>
      </footer>
    </main>
  );
}
