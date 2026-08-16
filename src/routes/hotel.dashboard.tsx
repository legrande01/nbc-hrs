import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Star, TrendingDown, TrendingUp } from "lucide-react";

import {
  AdminCard,
  AdminCardHeader,
  AdminLink,
  HotelAdminLayout,
} from "@/components/nbc/HotelAdminLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adminGreeting,
  formatTzs,
  hotelKpis,
  hotelProperty,
  needsAttention,
  quickActions,
  recentHotelActivity,
  reservationStatusTone,
  reservationTrend7,
  reservationTrend30,
  reviewsSummary,
  roomStatus,
  servicePending,
  todayStats,
  todaysReservations,
  type ReservationTrendPoint,
} from "@/lib/nbc-hotel-admin";

export const Route = createFileRoute("/hotel/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hotel Admin Dashboard · NBC Hospitality" },
      {
        name: "description",
        content:
          "Operational command centre for NBC Hospitality hotel partners — today's arrivals, occupancy, revenue, room status and items needing attention.",
      },
      { property: "og:title", content: "Hotel Admin Dashboard · NBC Hospitality" },
      {
        property: "og:description",
        content:
          "Track today's bookings, occupancy, room status and operational exceptions across your property.",
      },
    ],
  }),
  component: HotelDashboardPage,
});

const totalRooms = roomStatus.reduce((sum, entry) => sum + entry.count, 0);

function ViewAllLink({ to, label }: { to: string; label: string }) {
  return (
    <AdminLink
      to={to}
      className="inline-flex items-center gap-1 text-sm font-medium text-nbc-royal hover:underline"
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-4" />
    </AdminLink>
  );
}

function KpiRow() {
  return (
    <div className="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
      {hotelKpis.map((kpi) => {
        const Icon = kpi.icon;
        const Trend = kpi.trend?.direction === "down" ? TrendingDown : TrendingUp;
        return (
          <AdminLink
            key={kpi.label}
            to={kpi.to}
            className="min-w-[15rem] shrink-0 snap-start rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-colors hover:border-nbc-royal/30 sm:min-w-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-nbc-royal/10 text-nbc-royal"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.context}</p>
            {kpi.trend ? (
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                  kpi.trend.direction === "up" ? "text-nbc-emerald" : "text-nbc-scarlet",
                )}
              >
                <Trend aria-hidden="true" className="size-3.5" />
                {kpi.trend.label}
              </p>
            ) : null}
          </AdminLink>
        );
      })}
    </div>
  );
}

function TrendChart({ data }: { data: ReservationTrendPoint[] }) {
  const max = Math.max(...data.flatMap((d) => [d.confirmed, d.checkedIn, d.checkedOut]));
  const series = [
    { key: "confirmed" as const, label: "Confirmed", tone: "bg-nbc-royal" },
    { key: "checkedIn" as const, label: "Checked-in", tone: "bg-nbc-emerald" },
    { key: "checkedOut" as const, label: "Checked-out", tone: "bg-nbc-gold" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", s.tone)} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="mt-4 flex h-48 items-end gap-3">
        {data.map((point) => (
          <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              {series.map((s) => (
                <div
                  key={s.key}
                  title={`${s.label}: ${point[s.key]}`}
                  className={cn("w-full max-w-3 rounded-t-md", s.tone)}
                  style={{ height: `${Math.max(4, (point[s.key] / max) * 100)}%` }}
                />
              ))}
            </div>
            <span className="truncate text-xs text-muted-foreground">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationsOverview() {
  const [range, setRange] = useState<"7" | "30">("7");
  const data = range === "7" ? reservationTrend7 : reservationTrend30;

  return (
    <AdminCard>
      <AdminCardHeader
        title="Reservations Overview"
        description="Confirmed, checked-in and checked-out reservations."
        action={
          <div className="inline-flex rounded-xl border border-border/70 bg-secondary/40 p-1">
            {(["7", "30"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRange(value)}
                aria-pressed={range === value}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  range === value
                    ? "bg-card text-nbc-royal shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value} Days
              </button>
            ))}
          </div>
        }
      />
      <TrendChart data={data} />
      <div className="mt-4 border-t border-border/70 pt-4">
        <ViewAllLink to="/hotel/reservations" label="View All Reservations" />
      </div>
    </AdminCard>
  );
}

function RoomStatusWidget() {
  return (
    <AdminCard>
      <AdminCardHeader
        title="Room Status"
        description={`${totalRooms} rooms across the property.`}
      />
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {roomStatus.map((entry) => (
          <span
            key={entry.key}
            aria-hidden="true"
            className={entry.tone}
            style={{ width: `${(entry.count / totalRooms) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {roomStatus.map((entry) => (
          <li key={entry.key}>
            <AdminLink
              to={entry.to}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:border-nbc-royal/30 hover:bg-secondary/50"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className={cn("size-2.5 rounded-full", entry.tone)} />
                <span className="truncate text-sm font-medium text-foreground">{entry.label}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-foreground">
                {entry.count}
                <span className="ml-1 text-xs font-normal text-muted-foreground">rooms</span>
              </span>
            </AdminLink>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}

function TodaysReservations() {
  return (
    <AdminCard>
      <AdminCardHeader
        title="Today's Reservations"
        description="Arrivals, departures and requests dated today."
        action={<ViewAllLink to="/hotel/reservations" label="View All Reservations" />}
      />

      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/70 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="py-2 pr-3">Reference</th>
              <th scope="col" className="py-2 pr-3">Guest</th>
              <th scope="col" className="py-2 pr-3">Room</th>
              <th scope="col" className="py-2 pr-3">Check-in</th>
              <th scope="col" className="py-2 pr-3">Check-out</th>
              <th scope="col" className="py-2 pr-3">Amount</th>
              <th scope="col" className="py-2 pr-3">Status</th>
              <th scope="col" className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {todaysReservations.map((row) => (
              <tr key={row.reference} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-3 font-medium text-foreground">{row.reference}</td>
                <td className="py-3 pr-3 text-foreground">{row.guest}</td>
                <td className="py-3 pr-3 text-muted-foreground">{row.room}</td>
                <td className="py-3 pr-3 text-muted-foreground">{row.checkIn}</td>
                <td className="py-3 pr-3 text-muted-foreground">{row.checkOut}</td>
                <td className="py-3 pr-3 whitespace-nowrap text-foreground">
                  {formatTzs(row.amountTzs)}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      reservationStatusTone[row.status],
                    )}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <AdminLink to="/hotel/reservations">{row.action}</AdminLink>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet list */}
      <ul className="grid gap-3 lg:hidden">
        {todaysReservations.map((row) => (
          <li
            key={row.reference}
            className="rounded-xl border border-border/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{row.guest}</p>
                <p className="truncate text-xs text-muted-foreground">{row.reference}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  reservationStatusTone[row.status],
                )}
              >
                {row.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{row.room}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {row.checkIn} → {row.checkOut}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {formatTzs(row.amountTzs)}
              </span>
              <Button variant="outline" size="sm" asChild>
                <AdminLink to="/hotel/reservations">{row.action}</AdminLink>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}

function NeedsAttention() {
  return (
    <AdminCard>
      <AdminCardHeader
        title="Needs Attention"
        description="Operational exceptions waiting on your team."
      />
      <ul className="grid gap-2">
        {needsAttention.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <AdminLink
                to={item.to}
                className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:border-nbc-royal/30 hover:bg-secondary/50"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl",
                    item.urgent
                      ? "bg-nbc-scarlet/10 text-nbc-scarlet"
                      : "bg-nbc-royal/10 text-nbc-royal",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {item.count} · {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.detail}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-nbc-royal">
                  View
                  <ArrowRight aria-hidden="true" className="size-4" />
                </span>
              </AdminLink>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}

function ServicesWidget() {
  return (
    <AdminCard>
      <AdminCardHeader title="Hotel Services" description="Pending guest service requests." />
      <ul className="grid gap-2">
        {servicePending.map((service) => {
          const Icon = service.icon;
          return (
            <li key={service.label}>
              <AdminLink
                to={service.to}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary/60"
              >
                <span className="inline-flex min-w-0 items-center gap-2.5">
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-nbc-royal"
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-sm text-foreground">{service.label}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {service.count}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">pending</span>
                </span>
              </AdminLink>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 border-t border-border/70 pt-4">
        <ViewAllLink to="/hotel/services" label="View Services" />
      </div>
    </AdminCard>
  );
}

function ReviewsWidget() {
  return (
    <AdminCard>
      <AdminCardHeader title="Guest Experience" description="How guests rated your property." />
      <div className="flex items-center gap-3 rounded-xl bg-nbc-royal/5 p-4">
        <Star aria-hidden="true" className="size-6 fill-nbc-gold text-nbc-gold" />
        <div>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {reviewsSummary.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">
            Average rating · {reviewsSummary.totalReviews} reviews
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/70 p-3">
          <dt className="text-xs text-muted-foreground">New Reviews</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">
            {reviewsSummary.newReviews}
          </dd>
        </div>
        <div className="rounded-xl border border-border/70 p-3">
          <dt className="text-xs text-muted-foreground">Awaiting Response</dt>
          <dd className="mt-1 text-lg font-semibold text-nbc-scarlet">
            {reviewsSummary.awaitingResponse}
          </dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-border/70 pt-4">
        <ViewAllLink to="/hotel/reviews" label="View Reviews" />
      </div>
    </AdminCard>
  );
}

function RecentActivity() {
  return (
    <AdminCard>
      <AdminCardHeader title="Recent Activity" description="Today at your property." />
      <ol className="grid gap-3">
        {recentHotelActivity.map((entry) => {
          const Icon = entry.icon;
          return (
            <li key={`${entry.time}-${entry.title}`} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-nbc-royal"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
                {entry.reference ? (
                  <p className="truncate text-xs text-muted-foreground">{entry.reference}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{entry.time}</span>
            </li>
          );
        })}
      </ol>
    </AdminCard>
  );
}

function QuickActions() {
  return (
    <AdminCard>
      <AdminCardHeader title="Quick Actions" />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <AdminLink
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/70 p-4 text-center transition-colors hover:border-nbc-royal/30 hover:bg-secondary/50"
            >
              <Icon
                aria-hidden="true"
                className="size-5 text-nbc-royal"
                strokeWidth={1.75}
              />
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </AdminLink>
          );
        })}
      </div>
    </AdminCard>
  );
}

function HotelDashboardPage() {
  const greeting = adminGreeting(new Date());

  return (
    <HotelAdminLayout propertyName={hotelProperty.name}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Hotel Admin</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {greeting}, Admin
          </h1>
          <p className="mt-1 text-sm font-medium text-foreground">{hotelProperty.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening at your property today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <AdminLink to="/hotel/reservations/new">New Reservation</AdminLink>
          </Button>
          <Button variant="outline" asChild>
            <AdminLink to="/hotel/reservations/confirmed">Check-in Guest</AdminLink>
          </Button>
        </div>
      </header>

      <KpiRow />

      <p className="mt-4 rounded-2xl border border-border/70 bg-card px-5 py-3 text-sm text-muted-foreground shadow-card">
        <span className="font-semibold text-foreground">{todayStats.arrivals} arrivals</span> ·{" "}
        <span className="font-semibold text-foreground">{todayStats.departures} departures</span> ·{" "}
        <span className="font-semibold text-foreground">
          {todayStats.guestsStaying} guests staying
        </span>{" "}
        ·{" "}
        <span className="font-semibold text-foreground">
          {todayStats.housekeepingPending} rooms awaiting housekeeping
        </span>
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <ReservationsOverview />
        <RoomStatusWidget />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TodaysReservations />
        <NeedsAttention />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <ServicesWidget />
        <ReviewsWidget />
        <RecentActivity />
      </div>

      <div className="mt-5">
        <QuickActions />
      </div>
    </HotelAdminLayout>
  );
}
