import { useState, type ComponentProps, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";

import { NbcLogo } from "@/components/nbc/NbcLogo";
import { Button } from "@/components/ui/button";
import { demoHotelAdmin, isHotelAdminDevBypassEnabled } from "@/lib/nbc-dev-bypass";
import { navigationForRole, type HotelRole } from "@/lib/nbc-hotel-admin";
import { cn } from "@/lib/utils";

/**
 * Type-safe link for the hotel admin area.
 * `/hotel/dashboard` is a real route this sprint; every other module resolves
 * through the `/hotel/$` placeholder route until it is implemented.
 */
export function AdminLink({
  to,
  ...props
}: { to: string } & Omit<ComponentProps<typeof Link>, "to" | "params">) {
  if (to === "/hotel/dashboard") {
    return <Link to="/hotel/dashboard" {...props} />;
  }
  if (to === "/hotel/reservations") {
    return <Link to="/hotel/reservations" search={defaultReservationsSearch} {...(props as object)} />;
  }
  const splat = to.replace(/^\/hotel\/?/, "");
  return <Link to="/hotel/$" params={{ _splat: splat } as never} {...props} />;
}

function NavTree({ role, onNavigate }: { role: HotelRole; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (router) => router.location.pathname });
  const items = navigationForRole(role);
  const [open, setOpen] = useState<string[]>(() =>
    items
      .filter((item) => item.children?.some((child) => pathname === child.to))
      .map((item) => item.label),
  );

  const toggle = (label: string) =>
    setOpen((prev) =>
      prev.includes(label) ? prev.filter((entry) => entry !== label) : [...prev, label],
    );

  return (
    <ul className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        const branchActive =
          active || Boolean(item.children?.some((child) => pathname === child.to));
        const expanded = open.includes(item.label);

        return (
          <li key={item.label}>
            <div className="flex items-center gap-1">
              <AdminLink
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  branchActive
                    ? "bg-nbc-royal/10 text-nbc-royal"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </AdminLink>
              {item.children ? (
                <button
                  type="button"
                  onClick={() => toggle(item.label)}
                  aria-expanded={expanded}
                  aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn("size-4 transition-transform", expanded && "rotate-180")}
                  />
                </button>
              ) : null}
            </div>
            {item.children && expanded ? (
              <ul className="mt-1 ml-6 grid gap-0.5 border-l border-border/70 pl-3">
                {item.children.map((child) => {
                  const childActive = pathname === child.to;
                  return (
                    <li key={child.to}>
                      <AdminLink
                        to={child.to}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          childActive
                            ? "bg-nbc-royal/10 font-medium text-nbc-royal"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                        )}
                      >
                        {child.label}
                      </AdminLink>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

interface HotelAdminLayoutProps {
  children: ReactNode;
  role?: HotelRole;
  propertyName: string;
}

/** Shared shell for every hotel-side administration screen. */
export function HotelAdminLayout({
  children,
  role = "hotel_admin",
  propertyName,
}: HotelAdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/40">
      {isHotelAdminDevBypassEnabled ? (
        <div className="border-b border-nbc-gold/40 bg-nbc-gold/15 px-4 py-2 text-center text-xs font-medium text-foreground sm:text-sm">
          Development preview — signed in as {demoHotelAdmin.name} ({demoHotelAdmin.propertyName}).
          Verification, approval and role checks are bypassed in this environment only.
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border/70 bg-card lg:flex">
          <div className="border-b border-border/70 px-5 py-4">
            <NbcLogo height={28} />
            <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Hotel Operations
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{propertyName}</p>
          </div>
          <nav aria-label="Hotel administration" className="min-h-0 flex-1 overflow-y-auto p-3">
            <NavTree role={role} />
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
            <Button
              variant="outline"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-4" />
            </Button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Hotel Operations</p>
              <p className="truncate text-sm font-semibold text-foreground">{propertyName}</p>
            </div>
          </header>

          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-nbc-true-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[85vw] flex-col bg-card shadow-elevated">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="min-w-0">
                <NbcLogo height={24} />
                <p className="mt-2 truncate text-sm font-semibold text-foreground">
                  {propertyName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <nav
              aria-label="Hotel administration"
              className="min-h-0 flex-1 overflow-y-auto p-3"
            >
              <NavTree role={role} onNavigate={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Card surface shared by all hotel admin widgets. */
export function AdminCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-card", className)}
    >
      {children}
    </section>
  );
}

/** Widget header with an optional trailing action. */
export function AdminCardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
