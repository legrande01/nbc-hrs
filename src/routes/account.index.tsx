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

function DashboardPage() {
  const { profile, loading } = useNbcSession();
  const navigate = useNavigate();
  const now = new Date();

  async function handleSignOut() {
    await signOutEverywhere();
    await navigate({ to: "/" });
  }

  const firstName = profile?.firstName || "guest";

  return (
    <AccountLayout>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {loading ? "Welcome back" : `${greetingFor(now)}, ${firstName}`}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Welcome back to NBC Hospitality Reservation System.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="scarlet" asChild>
            <Link to="/hotels">Book a Hotel</Link>
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Booking summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardSummaries.map((summary) => {
          const Icon = summary.icon;
          return (
            <Link
              key={summary.label}
              to={summary.to}
              className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
            >
              <span className="grid size-10 place-items-center rounded-full border border-nbc-royal/15 bg-secondary/60 text-nbc-royal">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
              </span>
              <span className="text-2xl font-semibold text-foreground">{summary.value}</span>
              <span className="text-sm font-medium text-foreground">{summary.label}</span>
              <span className="text-xs text-muted-foreground">{summary.hint}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid min-w-0 gap-6">
          {/* Upcoming stay */}
          <AccountCard className="p-0">
            <div className="flex items-center justify-between gap-4 border-b border-border/60 p-6">
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
                      <h3 className="text-lg font-semibold text-foreground">
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

                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
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

                  <p className="mt-5 flex items-center gap-2 rounded-xl border border-nbc-gold/40 bg-nbc-gold/10 px-4 py-3 text-sm font-medium text-foreground">
                    <Clock3 aria-hidden="true" className="size-4 text-nbc-royal" />
                    {daysUntil(upcomingStay.checkIn, now)} days until check-in
                  </p>

                  <Button variant="scarlet" className="mt-5" asChild>
                    <Link to="/account/reservations">View Reservation</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <AccountEmptyState
                  title="No upcoming reservations"
                  description="Your next escape is waiting. Browse our collection and your stay will appear here the moment it is confirmed."
                  action={
                    <Button variant="scarlet" asChild>
                      <Link to="/hotels">Book a Hotel</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </AccountCard>

          {/* Recent activity */}
          <AccountCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/account/activity">View All Activity</Link>
              </Button>
            </div>
            {recentActivity.length === 0 ? (
              <AccountEmptyState
                className="mt-4"
                title="No recent activity"
                description="Once you book a stay, every confirmation, payment and reminder will be listed here."
              />
            ) : (
              <ol className="mt-5 grid gap-5">
                {recentActivity.map((entry, index) => {
                  const Icon = entry.icon;
                  const last = index === recentActivity.length - 1;
                  return (
                    <li key={entry.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full border border-nbc-royal/15 bg-secondary/60 text-nbc-royal">
                          <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                        </span>
                        {!last ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{entry.detail}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{entry.timeAgo}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </AccountCard>

          {/* Quick actions */}
          <AccountCard>
            <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Book Hotel", description: "Explore the NBC collection", to: "/hotels" as const, icon: Sparkles },
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
                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 p-5 transition-shadow hover:shadow-card"
                  >
                    <span className="grid size-10 place-items-center rounded-full border border-nbc-royal/15 bg-secondary/60 text-nbc-royal">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{action.label}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {action.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          </AccountCard>
        </div>

        <aside className="grid min-w-0 content-start gap-6">
          {/* Rewards */}
          <AccountCard>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Gift aria-hidden="true" className="size-5 text-nbc-royal" />
              Rewards & loyalty
            </h2>
            {rewardsSummary.points === 0 ? (
              <AccountEmptyState
                className="mt-4"
                title="No reward points yet"
                description="Your first completed stay starts your NBC Hospitality points balance."
              />
            ) : (
              <>
                <p className="mt-4 text-3xl font-semibold text-foreground">
                  {rewardsSummary.points.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Available reward points</p>
                <div className="mt-4 rounded-xl border border-border/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Last reward earned
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    +{rewardsSummary.lastEarnedPoints.toLocaleString()} points
                  </p>
                  <p className="text-xs text-muted-foreground">{rewardsSummary.lastEarnedLabel}</p>
                </div>
              </>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/account/rewards">View Rewards</Link>
            </Button>
          </AccountCard>

          {/* Payment methods */}
          <AccountCard>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Wallet aria-hidden="true" className="size-5 text-nbc-royal" />
              Payment methods
            </h2>
            {paymentSummary.defaultMethod ? (
              <div className="mt-4 grid gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Default payment method
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {paymentSummary.defaultMethod}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {paymentSummary.defaultMethodDetail}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    NBC account
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {paymentSummary.nbcAccountLinked ? "Linked" : "Not linked"}
                  </p>
                </div>
              </div>
            ) : (
              <AccountEmptyState
                className="mt-4"
                title="No payment method saved"
                description="Add a preferred way to pay and checkout becomes a single tap."
              />
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/account/payment-methods">Manage Payment Methods</Link>
            </Button>
          </AccountCard>
        </aside>
      </div>
    </AccountLayout>
  );
}
