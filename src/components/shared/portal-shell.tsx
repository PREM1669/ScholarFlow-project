import Link from "next/link";
import type { Role } from "@prisma/client";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { NAV_LINKS } from "@/lib/roles";

export function PortalShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6 sm:gap-10">
            <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
                <BookOpen className="size-[18px]" />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ScholarFlow
              </span>
            </Link>
            <nav aria-label="Main navigation" className="hidden items-center gap-1 sm:flex">
              {NAV_LINKS[user.role].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current="page"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  {link.label}
                  <ChevronRight className="size-3.5 opacity-60" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-40 truncate text-sm font-semibold leading-5 text-slate-800">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">{user.role.toLowerCase()}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-bold text-primary ring-1 ring-blue-200/70"
            >
              {initials}
            </span>
            <Badge className="hidden sm:inline-flex" variant="secondary">
              {user.role}
            </Badge>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}
