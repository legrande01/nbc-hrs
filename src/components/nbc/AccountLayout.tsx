import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { accountNavigation, initialsFor } from "@/lib/nbc-dashboard";
import { useNbcSession } from "@/lib/nbc-session";
import { cn } from "@/lib/utils";

interface AccountLayoutProps {
  children: ReactNode;
}

/**
 * Shared frame for every authenticated customer screen.
 * Left sidebar navigation on desktop, horizontally scrollable rail on mobile.
 */
export function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const isActive = (to: string) => pathname === to || pathname === `${to}/`;
  const { profile } = useNbcSession();

  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "NBC Guest";
  const initials = initialsFor(profile?.firstName, profile?.lastName, profile?.email);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <nav aria-label="Account" className="min-w-0 lg:col-span-3 xl:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card lg:flex">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-nbc-royal text-sm font-semibold text-primary-foreground"
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile?.email ?? "Signed in"}
                  </p>
                </div>
              </div>
              <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {accountNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <li key={item.to} className="shrink-0 lg:shrink">
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "border-nbc-royal/25 bg-nbc-royal/10 text-nbc-royal"
                            : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
          <div className="min-w-0 lg:col-span-9 xl:col-span-10">{children}</div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

/** Card surface reused by every dashboard widget. */
export function AccountCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border/70 bg-card p-6 shadow-card", className)}
    >
      {children}
    </section>
  );
}

/** Hospitality-friendly empty state used across dashboard widgets. */
export function AccountEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border border-dashed border-border/70 bg-secondary/30 p-6 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto max-w-prose text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-1 flex justify-center">{action}</div> : null}
    </div>
  );
}
