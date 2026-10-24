"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/shared/mobile-nav";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { NAV_LINKS } from "@/lib/roles";
import { cn, isActivePath } from "@/lib/utils";

export function PortalShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-10">
            <MobileNav role={user.role} />
            <Link href="/" className="group inline-flex shrink-0 items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/25 transition-transform group-hover:scale-105">
                <BookOpen className="size-[18px]" />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900">
                ScholarFlow
              </span>
            </Link>
            <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS[user.role].map((link) => (
                (() => {
                  const active = isActivePath(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      {link.label}
                      {active && <ChevronRight className="size-3.5 opacity-60" />}
                    </Link>
                  );
                })()
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
