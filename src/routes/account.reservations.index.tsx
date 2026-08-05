import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { ReservationCard } from "@/components/nbc/ReservationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  reservations,
  reservationStatusLabels,
  type Reservation,
  type ReservationStatus,
} from "@/lib/nbc-reservations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/reservations/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/reservations" } });
  },
  head: () => ({
    meta: [
      { title: "My reservations · NBC Hospitality" },
      {
        name: "description",
        content:
          "Search, filter and manage every NBC Hospitality reservation — upcoming, pending payment, completed and cancelled.",
      },
      { property: "og:title", content: "My reservations · NBC Hospitality" },
      {
        property: "og:description",
        content: "Manage your upcoming and past stays across the NBC Hospitality network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReservationsPage,
});

type StatusFilter = ReservationStatus | "all";
type SortKey = "upcoming" | "recent" | "oldest";

const summaryCards: { key: ReservationStatus; label: string; hint: string }[] = [
  { key: "upcoming", label: "Upcoming", hint: "Stays ahead of you" },
  { key: "pending-payment", label: "Pending Payment", hint: "Awaiting settlement" },
  { key: "completed", label: "Completed", hint: "Stays enjoyed" },
  { key: "cancelled", label: "Cancelled", hint: "No longer active" },
];

function ReservationsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [destination, setDestination] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("upcoming");

  const destinations = useMemo(
    () => Array.from(new Set(reservations.map((item) => item.destination))).sort(),
    [],
  );

  const counts = useMemo(() => {
    const map = new Map<ReservationStatus, number>();
    reservations.forEach((item) => map.set(item.status, (map.get(item.status) ?? 0) + 1));
    return map;
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = reservations.filter((item) => {
      if (term && !`${item.reference} ${item.hotelName}`.toLowerCase().includes(term)) return false;
      if (status !== "all" && item.status !== status) return false;
      if (destination !== "all" && item.destination !== destination) return false;
      if (from && item.checkOut < from) return false;
      if (to && item.checkIn > to) return false;
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "recent") return b.bookedOn.localeCompare(a.bookedOn);
      if (sort === "oldest") return a.bookedOn.localeCompare(b.bookedOn);
      return a.checkIn.localeCompare(b.checkIn);
    });
    return sorted;
  }, [query, status, destination, from, to, sort]);

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setDestination("all");
    setFrom("");
    setTo("");
    setSort("upcoming");
  };

  return (
    <AccountLayout>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          My reservations
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Everything you have booked with NBC Hospitality, in one place.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const active = status === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setStatus(active ? "all" : card.key)}
              aria-pressed={active}
              className={cn(
                "rounded-2xl border bg-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5",
                active ? "border-nbc-royal/40 ring-1 ring-nbc-royal/20" : "border-border/70",
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {counts.get(card.key) ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </button>
          );
        })}
      </div>

      <AccountCard className="mt-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reservation-search">Search</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
              />
              <Input
                id="reservation-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Booking reference or hotel name"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(Object.keys(reservationStatusLabels) as ReservationStatus[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {reservationStatusLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="All destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {destinations.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date-from">From</Label>
              <Input
                id="date-from"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date-to">To</Label>
              <Input
                id="date-to"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Sort by</Label>
              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="recent">Recent bookings</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </AccountCard>

      <div className="mt-6 grid gap-5">
        {results.length === 0 ? (
          <AccountCard>
            <AccountEmptyState
              title="No reservations found"
              description="Nothing matches these filters yet. Adjust your search, or explore hotels across Tanzania for your next stay."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                  <Button asChild>
                    <Link to="/hotels">Explore hotels</Link>
                  </Button>
                </div>
              }
            />
          </AccountCard>
        ) : (
          results.map((reservation: Reservation) => (
            <ReservationCard key={reservation.reference} reservation={reservation} />
          ))
        )}
      </div>
    </AccountLayout>
  );
}
