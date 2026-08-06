import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BellRing, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  demoNotifications,
  formatNotificationTime,
  notificationCategoryMeta,
  sortNotifications,
  type NbcNotification,
  type NotificationCategory,
  type NotificationSort,
} from "@/lib/nbc-notifications";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/notifications")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/notifications" } });
  },
  head: () => ({
    meta: [
      { title: "Notifications · NBC Hospitality" },
      {
        name: "description",
        content:
          "Reservation updates, payment confirmations, rewards and offers — collected in one calm inbox.",
      },
      { property: "og:title", content: "Notifications · NBC Hospitality" },
      {
        property: "og:description",
        content: "Stay updated with your reservations, payments, rewards and account activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

type TabValue = "all" | NotificationCategory;

const tabs: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reservations", label: "Reservations" },
  { value: "payments", label: "Payments" },
  { value: "rewards", label: "Rewards" },
  { value: "promotions", label: "Promotions" },
  { value: "system", label: "System" },
];

function NotificationsPage() {
  const [items, setItems] = useState<NbcNotification[]>(demoNotifications);
  const [tab, setTab] = useState<TabValue>("all");
  const [sort, setSort] = useState<NotificationSort>("newest");

  const summary = useMemo(
    () => [
      { label: "Total Notifications", value: items.length, hint: "In your inbox" },
      {
        label: "Unread",
        value: items.filter((item) => !item.read).length,
        hint: "Waiting for you",
      },
      {
        label: "Reservation Updates",
        value: items.filter((item) => item.category === "reservations").length,
        hint: "Stay related",
      },
      {
        label: "Promotions",
        value: items.filter((item) => item.category === "promotions").length,
        hint: "Member offers",
      },
    ],
    [items],
  );

  const visible = useMemo(() => {
    const filtered = tab === "all" ? items : items.filter((item) => item.category === tab);
    return sortNotifications(filtered, sort);
  }, [items, tab, sort]);

  const unreadCount = items.filter((item) => !item.read).length;

  const markRead = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    toast.success("All notifications marked as read");
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast("Notification removed");
  };

  return (
    <AccountLayout>
      <header className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Stay updated with your reservations, payments, rewards and important account activities.
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck aria-hidden="true" className="size-4" strokeWidth={1.75} />
          Mark all as read
        </Button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <AccountCard key={card.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
          </AccountCard>
        ))}
      </div>

      <AccountCard className="mt-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
            <TabsList className="flex w-full flex-wrap justify-start gap-1 lg:w-auto">
              {tabs.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 lg:justify-end">
            <span className="text-xs font-medium text-muted-foreground">Sort</span>
            <Select value={sort} onValueChange={(value) => setSort(value as NotificationSort)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="unread">Unread first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {visible.length === 0 ? (
          <AccountEmptyState
            className="mt-6"
            title="You're all caught up."
            description="We'll notify you whenever something important happens."
            action={
              <Button asChild>
                <Link to="/hotels">Explore Hotels</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-6 grid gap-3">
            {visible.map((item) => {
              const Icon = notificationCategoryMeta[item.category].icon;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "grid gap-4 rounded-xl border p-4 transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start",
                    item.read
                      ? "border-border/70 bg-card"
                      : "border-nbc-royal/25 bg-nbc-royal/[0.04]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      item.read
                        ? "bg-secondary/70 text-muted-foreground"
                        : "bg-nbc-royal/10 text-nbc-royal",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
                          item.read
                            ? "bg-secondary text-muted-foreground"
                            : "bg-nbc-scarlet/10 text-nbc-scarlet",
                        )}
                      >
                        {item.read ? "Read" : "Unread"}
                      </span>
                      <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                        {notificationCategoryMeta[item.category].label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatNotificationTime(item.timestamp)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    {!item.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(item.id)}>
                        <BellRing aria-hidden="true" className="size-4" strokeWidth={1.75} />
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete notification: ${item.title}`}
                      onClick={() => remove(item.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AccountCard>
    </AccountLayout>
  );
}
