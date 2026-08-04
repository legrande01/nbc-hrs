import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Gift,
  Heart,
  MapPin,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  dashboardSummaries,
  daysUntil,
  formatStayDate,
  greetingFor,
  paymentSummary,
  recentActivity,
  rewardsSummary,
  upcomingStay,
} from "@/lib/nbc-dashboard";
import { cn } from "@/lib/utils";
import { useNbcSession } from "@/lib/nbc-session";


export const Route = createFileRoute("/account/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account" } });
  },
  head: () => ({
    meta: [
      { title: "Dashboard · NBC Hospitality" },
      {
        name: "description",
        content:
          "Your NBC Hospitality dashboard — upcoming stays, rewards, payment methods and recent activity in one place.",
      },
      { property: "og:title", content: "Dashboard · NBC Hospitality" },
      {
        property: "og:description",
        content: "Upcoming stays, rewards and recent activity across NBC Hospitality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const activityTone = {
  success: "border-nbc-royal/15 bg-nbc-royal/10 text-nbc-royal",
  info: "border-border bg-secondary/60 text-foreground",
  pending: "border-nbc-gold/40 bg-nbc-gold/15 text-foreground",
} as const;

function DashboardPage() {
  const { profile, loading } = useNbcSession();
  const now = new Date();

  const firstName = profile?.firstName || "guest";
  const milestoneGap = Math.max(0, rewardsSummary.nextMilestone - rewardsSummary.points);
  const milestoneProgress = Math.min(
    100,
    Math.round((rewardsSummary.points / Math.max(1, rewardsSummary.nextMilestone)) * 100),
  );

  return (
    <AccountLayout>
      {/* Row 1 — Welcome */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {loading ? "Welcome back" : `${greetingFor(now)}, ${firstName} 👋`}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Welcome back to NBC Hospitality. Ready for your next stay?
          </p>
        </div>
        <Button variant="scarlet" asChild>
          <Link to="/hotels">Book a Hotel</Link>
        </Button>
      </header>

      {/* Row 2 — Summary statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardSummaries.map((summary) => {
          const Icon = summary.icon;
          return (
            <Link
              key={summary.label}
              to={summary.to}
              className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-nbc-royal/25 hover:shadow-elevated"
            >
              <span className="grid size-12 place-items-center rounded-2xl border border-nbc-royal/15 bg-nbc-royal/10 text-nbc-royal transition-colors group-hover:bg-nbc-royal group-hover:text-primary-foreground">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
              </span>
              <span className="text-3xl font-semibold leading-none text-foreground">
                {summary.value}
              </span>
              <span className="text-sm font-medium text-foreground">{summary.label}</span>
              <span className="text-xs text-muted-foreground">{summary.hint}</span>
            </Link>
          );
        })}
      </div>

      {/* Rows 3 & 4 — 8/4 split */}
      <div className="mt-6 grid gap-6 xl:grid-cols-12">
        {/* Row 3 — Upcoming stay */}
        <AccountCard className="min-w-0 p-0 xl:col-span-8">
          <div className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarDays aria-hidden="true" className="size-5 text-nbc-royal" />
              Your upcoming stay
            </h2>
          </div>
          {upcomingStay ? (
            <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
              <img
                src={upcomingStay.image}
                alt={`${upcomingStay.hotelName} in ${upcomingStay.location}`}
                loading="lazy"
                className="h-48 w-full rounded-xl object-cover md:h-full"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold text-foreground">
                      {upcomingStay.hotelName}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin aria-hidden="true" className="size-4" />
                      {upcomingStay.location}
                    </p>
                  </div>
                  <span className="rounded-full border border-nbc-royal/20 bg-nbc-royal/10 px-3 py-1 text-xs font-semibold text-nbc-royal">
                    {upcomingStay.status}
                  </span>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Booking reference
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {upcomingStay.reference}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Guests
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Users aria-hidden="true" className="size-4 text-nbc-royal" />
                      {upcomingStay.guests} guests
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Check-in
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {formatStayDate(upcomingStay.checkIn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Check-out
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-foreground">
                      {formatStayDate(upcomingStay.checkOut)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 flex items-center gap-2 rounded-xl border border-nbc-gold/40 bg-nbc-gold/10 px-4 py-3 text-sm font-medium text-foreground">
                  <Clock3 aria-hidden="true" className="size-4 text-nbc-royal" />
                  {daysUntil(upcomingStay.checkIn, now)} days until check-in
                </p>

                <Button variant="scarlet" className="mt-6" asChild>
                  <Link to="/account/reservations">View Reservation</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <AccountEmptyState
                title="Ready for your next getaway?"
                description="Discover verified hotels across Tanzania and start planning your next stay."
                action={
                  <Button variant="scarlet" asChild>
                    <Link to="/hotels">Explore Hotels</Link>
                  </Button>
                }
              />
            </div>
          )}
        </AccountCard>

        {/* Row 3 — Rewards */}
        <AccountCard className="flex min-w-0 flex-col xl:col-span-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Gift aria-hidden="true" className="size-5 text-nbc-royal" />
            Rewards & loyalty
          </h2>
          {rewardsSummary.points === 0 ? (
            <AccountEmptyState
              className="mt-4 flex-1"
              title="No reward points yet"
              description="Your first completed stay starts your NBC Hospitality points balance."
              action={
                <Button variant="scarlet" asChild>
                  <Link to="/hotels">Book a Hotel</Link>
                </Button>
              }
            />
          ) : (
            <div className="mt-4 flex-1">
              <p className="text-4xl font-semibold leading-none text-foreground">
                {rewardsSummary.points.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Available reward points</p>

              <div className="mt-5 rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Lifetime points</span>
                  <span className="font-semibold text-foreground">
                    {rewardsSummary.lifetimePoints.toLocaleString()}
                  </span>
                </div>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-valuenow={milestoneProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress to next reward milestone"
                >
                  <span
                    className="block h-full rounded-full bg-nbc-royal"
                    style={{ width: `${milestoneProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {milestoneGap.toLocaleString()} points until your next reward.
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Last reward earned
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  +{rewardsSummary.lastEarnedPoints.toLocaleString()} points
                </p>
                <p className="text-xs text-muted-foreground">{rewardsSummary.lastEarnedLabel}</p>
              </div>
            </div>
          )}
          <Button variant="outline" className="mt-5 w-full" asChild>
            <Link to="/account/rewards">View Rewards</Link>
          </Button>
        </AccountCard>

        {/* Row 4 — Recent activity */}
        <AccountCard className="min-w-0 xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/account/activity">View All Activity</Link>
            </Button>
          </div>
          {recentActivity.length === 0 ? (
            <AccountEmptyState
              className="mt-4"
              title="No recent activity yet"
              description="Once you book a stay, every confirmation, payment and reminder will appear here."
              action={
                <Button variant="scarlet" asChild>
                  <Link to="/hotels">Explore Hotels</Link>
                </Button>
              }
            />
          ) : (
            <ol className="mt-6 grid gap-5">
              {recentActivity.map((entry, index) => {
                const Icon = entry.icon;
                const last = index === recentActivity.length - 1;
                return (
                  <li key={entry.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full border",
                          activityTone[entry.tone],
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                      </span>
                      {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{entry.detail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.timeAgo}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AccountCard>

        {/* Row 4 — Payment methods */}
        <AccountCard className="flex min-w-0 flex-col xl:col-span-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Wallet aria-hidden="true" className="size-5 text-nbc-royal" />
            Payment methods
          </h2>
          {paymentSummary.defaultMethod ? (
            <div className="mt-4 flex-1">
              <div className="rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Default payment method
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {paymentSummary.defaultMethod}
                </p>
                <p className="text-xs text-muted-foreground">
                  {paymentSummary.defaultMethodDetail}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    NBC account
                  </p>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      paymentSummary.nbcAccountLinked
                        ? "border-nbc-royal/20 bg-nbc-royal/10 text-nbc-royal"
                        : "border-border bg-secondary/60 text-muted-foreground",
                    )}
                  >
                    {paymentSummary.nbcAccountLinked ? "Linked" : "Not linked"}
                  </span>
                </div>
                {paymentSummary.nbcAccountLinked ? (
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {paymentSummary.nbcAccountMasked ?? "•••• ••••"}
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Link your NBC Account
                    </p>
                    <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <ArrowRight aria-hidden="true" className="mt-0.5 size-3 text-nbc-royal" />
                        Pay directly from your NBC Account
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight aria-hidden="true" className="mt-0.5 size-3 text-nbc-royal" />
                        Redeem reward points
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          ) : (
            <AccountEmptyState
              className="mt-4 flex-1"
              title="No payment method saved"
              description="Add a preferred way to pay and checkout becomes a single tap."
              action={
                <Button variant="outline" asChild>
                  <Link to="/account/payment-methods">Add a method</Link>
                </Button>
              }
            />
          )}
          <Button variant="outline" className="mt-5 w-full" asChild>
            <Link to="/account/payment-methods">Manage Payment Methods</Link>
          </Button>
        </AccountCard>
      </div>

      {/* Row 5 — Quick actions */}
      <AccountCard className="mt-6">
        <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Book Hotel",
              description: "Explore the NBC collection",
              to: "/hotels" as const,
              icon: Sparkles,
            },
            {
              label: "Find My Reservation",
              description: "Look up a booking reference",
              to: "/find-reservation" as const,
              icon: Search,
            },
            {
              label: "Browse Favourite Hotels",
              description: "Return to your saved stays",
              to: "/account/favourites" as const,
              icon: Heart,
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.to}
                className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-nbc-royal/25 hover:shadow-elevated"
              >
                <span className="grid size-12 place-items-center rounded-2xl border border-nbc-royal/15 bg-nbc-royal/10 text-nbc-royal transition-colors group-hover:bg-nbc-royal group-hover:text-primary-foreground">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
                </span>
                <span className="text-sm font-semibold text-foreground">{action.label}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {action.description}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-nbc-royal">
                  Continue
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </AccountCard>
    </AccountLayout>
  );
}

