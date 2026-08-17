import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarRange, Plus, Search } from "lucide-react";

import { AdminCard, HotelAdminLayout } from "@/components/nbc/HotelAdminLayout";
import { Badge } from "@/components/ui/badge";
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
import {
  formatTzs,
  hotelProperty,
  reservationStatusTone,
  type HotelReservationStatus,
} from "@/lib/nbc-hotel-admin";
import {
  formatDay,
  hotelReservations,
  paymentStatuses,
  paymentStatusTone,
  primaryRowAction,
  reservationStatuses,
  roomCategories,
  type HotelPaymentStatus,
  type HotelReservation,
} from "@/lib/nbc-hotel-reservations";
import { cn } from "@/lib/utils";

interface ReservationsSearch {
  q: string;
  status: string;
  payment: string;
  room: string;
  source: string;
  from: string;
  to: string;
  sort: string;
  page: number;
}

const PAGE_SIZE = 8;

const sortOptions = [
  { value: "newest", label: "Newest booking" },
  { value: "check-in", label: "Check-in date" },
  { value: "check-out", label: "Check-out date" },
  { value: "guest", label: "Guest name" },
  { value: "amount", label: "Amount" },
];

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export const Route = createFileRoute("/hotel/reservations/")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): ReservationsSearch => ({
    q: str(search.q),
    status: str(search.status, "All"),
    payment: str(search.payment, "All"),
    room: str(search.room, "All"),
    source: str(search.source, "All"),
    from: str(search.from),
    to: str(search.to),
    sort: str(search.sort, "newest"),
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Reservations · NBC Hospitality Hotel Operations" },
      {
        name: "description",
        content:
          "Manage bookings, guest stays, room assignments and reservation status from one hotel operations workspace.",
      },
      { property: "og:title", content: "Reservations · NBC Hospitality Hotel Operations" },
      {
        property: "og:description",
        content: "Search, filter and action every reservation for your property.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReservationsPage,
});

function matches(reservation: HotelReservation, search: ReservationsSearch): boolean {
  const query = search.q.trim().toLowerCase();
  if (query) {
    const haystack = [
      reservation.reference,
      reservation.guest.name,
      reservation.guest.phone,
      reservation.guest.email,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (search.status !== "All" && reservation.status !== search.status) return false;
  if (search.payment !== "All" && reservation.paymentStatus !== search.payment) return false;
  if (search.room !== "All" && reservation.roomCategory !== search.room) return false;
  if (search.source !== "All" && reservation.source !== search.source) return false;
  if (search.from && reservation.checkOut < search.from) return false;
  if (search.to && reservation.checkIn > search.to) return false;
  return true;
}

function sortReservations(list: HotelReservation[], sort: string): HotelReservation[] {
  const sorted = [...list];
  switch (sort) {
    case "check-in":
      return sorted.sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    case "check-out":
      return sorted.sort((a, b) => a.checkOut.localeCompare(b.checkOut));
    case "guest":
      return sorted.sort((a, b) => a.guest.name.localeCompare(b.guest.name));
    case "amount":
      return sorted.sort((a, b) => b.total - a.total);
    case "newest":
    default:
      return sorted.sort((a, b) => b.bookedOn.localeCompare(a.bookedOn));
  }
}

function StatusBadge({ status }: { status: HotelReservationStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", reservationStatusTone[status])}>
      {status}
    </Badge>
  );
}

function PaymentBadge({ status }: { status: HotelPaymentStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", paymentStatusTone[status])}>
      {status}
    </Badge>
  );
}

function ReservationsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/hotel/reservations" });

  const update = (patch: Partial<ReservationsSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }),
      replace: true,
    });

  const filtered = useMemo(
    () => sortReservations(hotelReservations.filter((r) => matches(r, search)), search.sort),
    [search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(search.page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const filtersActive =
    search.q !== "" ||
    search.status !== "All" ||
    search.payment !== "All" ||
    search.room !== "All" ||
    search.source !== "All" ||
    search.from !== "" ||
    search.to !== "";

  return (
    <HotelAdminLayout propertyName={hotelProperty.name}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Hotel operations</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Reservations
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Manage bookings, guest stays, room assignments and reservation status.
          </p>
        </div>
        <Button asChild>
          <Link to="/hotel/$" params={{ _splat: "reservations/new" }}>
            <Plus className="size-4" aria-hidden="true" />
            New Reservation
          </Link>
        </Button>
      </header>

      <AdminCard className="mt-6">
        <div className="grid gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder="Search by guest name, booking reference, phone or email"
              aria-label="Search reservations"
              className="pl-9"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Status"
              value={search.status}
              onChange={(value) => update({ status: value })}
              options={["All", ...reservationStatuses]}
            />
            <FilterSelect
              label="Payment status"
              value={search.payment}
              onChange={(value) => update({ payment: value })}
              options={["All", ...paymentStatuses]}
            />
            <FilterSelect
              label="Room category"
              value={search.room}
              onChange={(value) => update({ room: value })}
              options={["All", ...roomCategories]}
            />
            <FilterSelect
              label="Sort by"
              value={search.sort}
              onChange={(value) => update({ sort: value })}
              options={sortOptions.map((option) => option.value)}
              labels={Object.fromEntries(sortOptions.map((o) => [o.value, o.label]))}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="stay-from" className="text-xs text-muted-foreground">
                Stay from
              </Label>
              <Input
                id="stay-from"
                type="date"
                value={search.from}
                onChange={(event) => update({ from: event.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="stay-to" className="text-xs text-muted-foreground">
                Stay to
              </Label>
              <Input
                id="stay-to"
                type="date"
                value={search.to}
                onChange={(event) => update({ to: event.target.value })}
              />
            </div>
            <div className="flex items-end">
              {filtersActive ? (
                <Button
                  variant="ghost"
                  className="text-nbc-scarlet hover:text-nbc-scarlet"
                  onClick={() =>
                    update({
                      q: "",
                      status: "All",
                      payment: "All",
                      room: "All",
                      source: "All",
                      from: "",
                      to: "",
                    })
                  }
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="mt-6 p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Reservation list
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? "No reservations match these filters"
              : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <CalendarRange
              aria-hidden="true"
              className="mx-auto size-8 text-muted-foreground"
              strokeWidth={1.5}
            />
            <p className="mt-3 text-sm font-semibold text-foreground">No reservations found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust the search or filters to widen the view.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[62rem] text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Guest</th>
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Stay</th>
                    <th className="px-5 py-3 font-medium">Nights</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((reservation) => {
                    const rowAction = primaryRowAction(reservation);
                    return (
                      <tr
                        key={reservation.reference}
                        className="border-b border-border/50 last:border-0 hover:bg-secondary/40"
                      >
                        <td className="px-5 py-4 font-medium text-nbc-royal">
                          <Link
                            to="/hotel/reservations/$reference"
                            params={{ reference: reservation.reference }}
                            className="hover:underline"
                          >
                            {reservation.reference}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{reservation.guest.name}</p>
                          <p className="text-xs text-muted-foreground">{reservation.guest.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-foreground">
                            {reservation.assignedRoom
                              ? `Room ${reservation.assignedRoom}`
                              : "Not assigned"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.roomCategory}
                          </p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                          {formatDay(reservation.checkIn)} → {formatDay(reservation.checkOut)}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{reservation.nights}</td>
                        <td className="px-5 py-4 text-right whitespace-nowrap text-foreground">
                          {formatTzs(reservation.total)}
                        </td>
                        <td className="px-5 py-4">
                          <PaymentBadge status={reservation.paymentStatus} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={reservation.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {rowAction ? (
                              <Button size="sm" asChild>
                                <Link
                                  to="/hotel/reservations/$reference"
                                  params={{ reference: reservation.reference }}
                                >
                                  {rowAction}
                                </Link>
                              </Button>
                            ) : null}
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                to="/hotel/reservations/$reference"
                                params={{ reference: reservation.reference }}
                              >
                                View
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="grid gap-3 p-4 lg:hidden">
              {rows.map((reservation) => {
                const rowAction = primaryRowAction(reservation);
                return (
                  <li
                    key={reservation.reference}
                    className="rounded-xl border border-border/70 bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {reservation.guest.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{reservation.reference}</p>
                      </div>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Room</dt>
                        <dd className="text-foreground">
                          {reservation.assignedRoom
                            ? `Room ${reservation.assignedRoom}`
                            : "Not assigned"}
                          <span className="block text-muted-foreground">
                            {reservation.roomCategory}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Stay</dt>
                        <dd className="text-foreground">
                          {formatDay(reservation.checkIn)} → {formatDay(reservation.checkOut)}
                          <span className="block text-muted-foreground">
                            {reservation.nights} nights
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Amount</dt>
                        <dd className="text-foreground">{formatTzs(reservation.total)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Payment</dt>
                        <dd className="mt-0.5">
                          <PaymentBadge status={reservation.paymentStatus} />
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {rowAction ? (
                        <Button size="sm" asChild>
                          <Link
                            to="/hotel/reservations/$reference"
                            params={{ reference: reservation.reference }}
                          >
                            {rowAction}
                          </Link>
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          to="/hotel/reservations/$reference"
                          params={{ reference: reservation.reference }}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => update({ page: page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => update({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </AdminCard>
    </HotelAdminLayout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels?.[option] ?? option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
