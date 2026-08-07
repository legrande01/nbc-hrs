import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Crown, Gift, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  availableRewards,
  comingSoonBenefits,
  earnMethods,
  formatPoints,
  loyaltyMembership,
  loyaltyTiers,
  nextTierActions,
  nextTierAfter,
  redemptionHistory,
  rewardsFaq,
  tierForPoints,
  tierProgress,
  walletActivity,
  type RedemptionStatus,
} from "@/lib/nbc-rewards";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/rewards")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account/rewards" } });
  },
  head: () => ({
    meta: [
      { title: "Rewards & loyalty · NBC Hospitality" },
      {
        name: "description",
        content:
          "Track your NBC Hospitality points, unlock tier benefits and redeem rewards on your next stay.",
      },
      { property: "og:title", content: "Rewards & loyalty · NBC Hospitality" },
      {
        property: "og:description",
        content: "Points, tiers and rewards earned across NBC Hospitality stays.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RewardsPage,
});

const statusStyles: Record<RedemptionStatus, string> = {
  Completed: "border-emerald-600/25 bg-emerald-600/10 text-emerald-700",
  Pending: "border-nbc-gold/40 bg-nbc-gold/15 text-nbc-royal",
  Cancelled: "border-destructive/25 bg-destructive/10 text-destructive",
};

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function RewardsPage() {
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const membership = loyaltyMembership;

  const currentTier = useMemo(
    () => loyaltyTiers.find((tier) => tier.name === membership.tier) ?? loyaltyTiers[0],
    [membership.tier],
  );
  const nextTier = nextTierAfter(currentTier.name);
  const progress = tierProgress(membership.availablePoints, currentTier, nextTier);

  const summaryCards = [
    {
      label: "Available Points",
      value: formatPoints(membership.availablePoints),
      hint: "Ready to redeem",
      icon: Wallet,
    },
    {
      label: "Lifetime Points",
      value: formatPoints(membership.lifetimePoints),
      hint: `Member since ${membership.memberSince}`,
      icon: TrendingUp,
    },
    {
      label: "Points Expiring",
      value: formatPoints(membership.pointsExpiring),
      hint: `Expires ${membership.expiringOn}`,
      icon: Sparkles,
    },
    {
      label: "Next Reward",
      value: membership.nextRewardName,
      hint: `${formatPoints(membership.nextRewardPointsAway)} points away`,
      icon: Gift,
    },
  ];

  const redeem = (id: string, name: string, points: number) => {
    if (points > membership.availablePoints) {
      toast.error("You don't have enough points for this reward yet.");
      return;
    }
    setRedeemed((prev) => (prev.includes(id) ? prev : [...prev, id]));
    toast.success(`${name} redeemed`, {
      description: "We'll attach this reward to your next eligible reservation.",
    });
  };

  return (
    <AccountLayout>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Rewards &amp; Loyalty
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Earn points, unlock exclusive benefits and enjoy more rewarding stays with NBC
          Hospitality.
        </p>
      </header>

      {/* Membership hero */}
      <section className="mt-8 overflow-hidden rounded-2xl bg-nbc-royal p-6 text-primary-foreground shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-nbc-gold/50 bg-nbc-gold/15 px-3 py-1 text-xs font-semibold text-nbc-gold">
              <Crown aria-hidden="true" className="size-3.5" strokeWidth={2} />
              {currentTier.name} Member
            </span>
            <p className="mt-4 text-4xl font-semibold tracking-tight">
              {formatPoints(membership.availablePoints)}{" "}
              <span className="text-base font-medium text-primary-foreground/70">Points</span>
            </p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              {nextTier
                ? `${formatPoints(progress.remaining)} points until ${nextTier.name}`
                : "You've reached our highest tier — thank you for travelling with us."}
            </p>
            <p className="mt-1 text-xs text-primary-foreground/60">
              Member since {membership.memberSince}
            </p>
          </div>
          <Button variant="scarlet" asChild className="w-full sm:w-auto">
            <a href="#membership-tiers">View Tier Benefits</a>
          </Button>
        </div>

        <div className="mt-8">
          <Progress value={progress.percent} className="h-2 bg-primary-foreground/20" />
          <ul className="mt-3 grid grid-cols-4 gap-2 text-center">
            {loyaltyTiers.map((tier) => {
              const reached = membership.availablePoints >= tier.threshold;
              return (
                <li key={tier.name}>
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      tier.name === currentTier.name
                        ? "text-nbc-gold"
                        : reached
                          ? "text-primary-foreground"
                          : "text-primary-foreground/50",
                    )}
                  >
                    {tier.name}
                  </p>
                  <p className="text-[0.625rem] text-primary-foreground/50">
                    {formatPoints(tier.threshold)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Rewards summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <AccountCard key={card.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <Icon aria-hidden="true" className="size-4 text-nbc-royal" strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </AccountCard>
          );
        })}
      </div>

      {/* Ways to earn */}
      <AccountCard className="mt-6">
        <SectionTitle
          title="Ways to Earn"
          description="Every stay, review and campaign brings your next reward closer."
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {earnMethods.map((method) => {
            const Icon = method.icon;
            return (
              <li
                key={method.title}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 bg-secondary/20 p-5"
              >
                <span className="grid size-10 place-items-center rounded-full border border-nbc-royal/15 bg-card text-nbc-royal">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.6} />
                </span>
                <p className="text-sm font-semibold text-foreground">{method.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {method.description}
                </p>
                <p className="mt-auto text-xs font-semibold text-nbc-scarlet">{method.points}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-5">
          <Button variant="outline" asChild>
            <a href="#rewards-faq">Learn More</a>
          </Button>
        </div>
      </AccountCard>

      {/* Available rewards */}
      <AccountCard className="mt-6">
        <SectionTitle
          title="Available Rewards"
          description="Redeem your points for the moments that make a stay memorable."
        />
        {availableRewards.length === 0 ? (
          <AccountEmptyState
            title="No rewards available right now"
            description="New member rewards are added every season. Keep booking with NBC Hospitality and we'll let you know."
            action={
              <Button asChild>
                <Link to="/hotels">Explore Hotels</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {availableRewards.map((reward) => {
              const claimed = redeemed.includes(reward.id);
              const affordable = reward.points <= membership.availablePoints;
              return (
                <li
                  key={reward.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card"
                >
                  <img
                    src={reward.image}
                    alt={reward.name}
                    loading="lazy"
                    className="h-36 w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{reward.name}</p>
                      <span className="shrink-0 rounded-full border border-nbc-royal/20 bg-nbc-royal/10 px-2.5 py-0.5 text-xs font-semibold text-nbc-royal">
                        {formatPoints(reward.points)} pts
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {reward.description}
                    </p>
                    <Button
                      className="mt-auto w-full"
                      variant={claimed ? "outline" : "default"}
                      disabled={claimed || !affordable}
                      onClick={() => redeem(reward.id, reward.name, reward.points)}
                    >
                      {claimed ? "Redeemed" : affordable ? "Redeem Reward" : "Not enough points"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AccountCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Rewards wallet */}
        <AccountCard>
          <SectionTitle title="Rewards Wallet" description="Every point earned and redeemed." />
          {walletActivity.length === 0 ? (
            <AccountEmptyState
              title="No reward activity yet"
              description="Your first stay with NBC Hospitality starts your points journey."
              action={
                <Button asChild>
                  <Link to="/hotels">Book a Stay</Link>
                </Button>
              }
            />
          ) : (
            <ol className="grid gap-3">
              {walletActivity.map((entry) => {
                const Icon = entry.icon;
                const earned = entry.points >= 0;
                return (
                  <li
                    key={entry.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border/70 p-4"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-10 place-items-center rounded-full",
                        earned
                          ? "bg-emerald-600/10 text-emerald-700"
                          : "bg-nbc-scarlet/10 text-nbc-scarlet",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {entry.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.detail} · {entry.date}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        earned ? "text-emerald-700" : "text-nbc-scarlet",
                      )}
                    >
                      {earned ? "+" : "−"}
                      {formatPoints(Math.abs(entry.points))}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </AccountCard>

        {/* Redemption history */}
        <AccountCard>
          <SectionTitle title="Redemption History" description="Rewards you've already claimed." />
          {redemptionHistory.length === 0 ? (
            <AccountEmptyState
              title="No redemptions yet"
              description="When you redeem your first reward it will appear here with its status."
              action={
                <Button asChild>
                  <Link to="/hotels">Explore Hotels</Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3">
              {redemptionHistory.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-2 rounded-xl border border-border/70 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.reward}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPoints(item.points)} points · {item.date}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "justify-self-start rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:justify-self-end",
                      statusStyles[item.status],
                    )}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AccountCard>
      </div>

      {/* Membership tiers */}
      <div id="membership-tiers" className="scroll-mt-24">
        <AccountCard className="mt-6">
        <SectionTitle
          title="Membership Tiers"
          description={
            nextTier
              ? `You are ${formatPoints(progress.remaining)} points away from ${nextTier.name}.`
              : "You've reached our highest membership tier."
          }
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loyaltyTiers.map((tier) => {
            const active = tier.name === currentTier.name;
            return (
              <li
                key={tier.name}
                className={cn(
                  "flex min-w-0 flex-col gap-3 rounded-xl border p-5",
                  active
                    ? "border-nbc-royal/30 bg-nbc-royal/[0.05] shadow-card"
                    : "border-border/70 bg-card",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-foreground">{tier.name}</p>
                  {active ? (
                    <span className="rounded-full bg-nbc-gold/20 px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-nbc-royal">
                      Your tier
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{tier.tagline}</p>
                <p className="text-xs font-semibold text-nbc-scarlet">
                  {tier.threshold === 0
                    ? "From your first booking"
                    : `From ${formatPoints(tier.threshold)} points`}
                </p>
                <ul className="grid gap-2 text-sm leading-relaxed text-muted-foreground">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-nbc-royal/40" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          *Benefits marked with an asterisk are subject to availability at the hotel.
        </p>
      </AccountCard>
      </div>

      {/* Next tier progress */}
      <AccountCard className="mt-6">
        <SectionTitle
          title="You're Closer Than You Think"
          description={
            nextTier
              ? `Just ${formatPoints(progress.remaining)} points stand between you and ${nextTier.name}.`
              : "Keep enjoying your Diamond benefits on every stay."
          }
        />
        <Progress value={progress.percent} className="h-2" />
        <ul className="mt-5 grid gap-4 md:grid-cols-2">
          {nextTierActions.map((action) => {
            const Icon = action.icon;
            return (
              <li
                key={action.title}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-xl border border-border/70 p-4"
              >
                <span className="grid size-10 place-items-center rounded-full bg-secondary/60 text-nbc-royal">
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{action.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-emerald-700">
                  {action.points}
                </span>
              </li>
            );
          })}
        </ul>
      </AccountCard>

      {/* Coming soon */}
      <AccountCard className="mt-6">
        <SectionTitle
          title="Coming Soon"
          description="More ways to be rewarded are on their way to your membership."
        />
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {comingSoonBenefits.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex min-w-0 gap-3 rounded-xl border border-dashed border-border/70 bg-secondary/20 p-5"
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-nbc-royal"
                  strokeWidth={1.6}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </AccountCard>

      {/* FAQ */}
      <div id="rewards-faq" className="scroll-mt-24">
        <AccountCard className="mt-6">
        <SectionTitle title="Frequently Asked Questions" />
        <Accordion type="single" collapsible className="w-full">
          {rewardsFaq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </AccountCard>
      </div>
    </AccountLayout>
  );
}
