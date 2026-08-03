import type { ReactNode } from "react";

import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
  /** Wider shell for multi-step onboarding forms. */
  wide?: boolean;
  footer?: ReactNode;
}

/**
 * Shared page frame for every identity screen — customer and hotel partner.
 * Keeps one layout so no authentication surface reinvents the chrome.
 */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  aside,
  wide = false,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />
      <main className="flex-1">
        <div
          className={cn(
            "mx-auto w-full px-5 py-10 lg:px-8 lg:py-16",
            wide ? "max-w-5xl" : "max-w-xl",
          )}
        >
          <div className={cn(aside && "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]")}>
            <div className="min-w-0">
              <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">{eyebrow}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
              <div className="mt-8">{children}</div>
              {footer ? <div className="mt-6">{footer}</div> : null}
            </div>
            {aside ? <div className="min-w-0">{aside}</div> : null}
          </div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

/** Card surface reused by every identity form. */
export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
