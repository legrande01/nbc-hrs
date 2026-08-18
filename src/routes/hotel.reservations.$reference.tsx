import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Check,
  CircleDashed,
  Mail,
  Phone,
  XCircle,
} from "lucide-react";

import { AdminCard, AdminCardHeader, HotelAdminLayout } from "@/components/nbc/HotelAdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatTzs, hotelProperty, reservationStatusTone } from "@/lib/nbc-hotel-admin";
import {
  actionsFor,
  findHotelReservation,
  formatFullDate,
  journeyFor,
  paymentStatusTone,
  requestStatusTone,
  serviceStatusTone,
  type InternalNote,
} from "@/lib/nbc-hotel-reservations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hotel/reservations/$reference")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `Reservation ${params.reference} · NBC Hospitality Hotel Operations` },
      {
        name: "description",
        content:
          "Reservation workspace with stay details, guest summary, payments, services, requests and internal notes.",
      },
      {
        property: "og:title",
        content: `Reservation ${params.reference} · NBC Hospitality Hotel Operations`,
      },
      {
        property: "og:description",
        content: "Manage a single guest stay from one operational workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReservationWorkspace,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words text-foreground">{value}</dd>
    </div>
  );
}

function ReservationWorkspace() {
  const { reference } = Route.useParams();
  const reservation = findHotelReservation(reference);
  const [notes, setNotes] = useState<InternalNote[]>(reservation?.notes ?? []);
  const [draft, setDraft] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!reservation) {
    return (
      <HotelAdminLayout propertyName={hotelProperty.name}>
        <AdminCard>
          <p className="text-sm font-semibold text-foreground">Reservation not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reference} does not exist for this property.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/hotel/reservations">Back to reservations</Link>
          </Button>
        </AdminCard>
      </HotelAdminLayout>
    );
  }

  const balance = reservation.total - reservation.amountPaid;
  const actions = actionsFor(reservation);
  const journey = journeyFor(reservation);

  const addNote = () => {
    const body = draft.trim();
    if (!body) return;
    setNotes((prev) => [
      {
        id: `note-${Date.now()}`,
        body,
        author: "Amina J. · Hotel Admin",
        at: new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <HotelAdminLayout propertyName={hotelProperty.name}>
      <Link
        to="/hotel/reservations"
        search={{
          q: "",
          status: "All",
          payment: "All",
          room: "All",
          source: "All",
          from: "",
          to: "",
          sort: "newest",
          page: 1,
        }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Reservations
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Reservation</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {reservation.reference}
          </h1>
          <p className="mt-2 text-sm text-foreground">
            {reservation.guest.name} · {reservation.hotelName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatFullDate(reservation.checkIn)} → {formatFullDate(reservation.checkOut)} ·{" "}
            {reservation.adults + reservation.children} guests · {reservation.rooms}{" "}
            {reservation.rooms === 1 ? "room" : "rooms"}
          </p>
          <Badge
            variant="outline"
            className={cn("mt-3 font-medium", reservationStatusTone[reservation.status])}
          >
            {reservation.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) =>
            action.label === "Cancel" ? (
              <Button
                key={action.label}
                variant="outline"
                className="border-nbc-scarlet/40 text-nbc-scarlet hover:text-nbc-scarlet"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Reservation
              </Button>
            ) : (
              <Button
                key={action.label}
                variant={action.intent === "primary" ? "default" : "outline"}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      </header>

      {/* Journey */}
      <AdminCard className="mt-6">
        <AdminCardHeader title="Reservation journey" />
        <ol className="grid gap-4 sm:grid-flow-col sm:auto-cols-fr sm:gap-0">
          {journey.map((stage, index) => (
            <li key={stage.key} className="flex items-start gap-3 sm:block">
              <div className="flex items-center gap-0 sm:gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border",
                    stage.state === "done" &&
                      "border-transparent bg-nbc-royal text-primary-foreground",
                    stage.state === "current" && "border-nbc-royal bg-nbc-royal/10 text-nbc-royal",
                    stage.state === "todo" &&
                      "border-border bg-secondary/50 text-muted-foreground",
                    stage.state === "cancelled" &&
                      "border-nbc-scarlet/40 bg-nbc-scarlet/10 text-nbc-scarlet",
                  )}
                >
                  {stage.state === "done" ? (
                    <Check className="size-4" strokeWidth={1.75} />
                  ) : stage.state === "cancelled" ? (
                    <XCircle className="size-4" strokeWidth={1.75} />
                  ) : (
                    <CircleDashed className="size-4" strokeWidth={1.75} />
                  )}
                </span>
                {index < journey.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "hidden h-px flex-1 sm:block",
                      stage.state === "todo" ? "bg-border" : "bg-nbc-royal/40",
                    )}
                  />
                ) : null}
              </div>
              <p
                className={cn(
                  "text-sm font-medium sm:mt-3",
                  stage.state === "todo" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {stage.label}
              </p>
            </li>
          ))}
        </ol>
      </AdminCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          {/* Stay details */}
          <AdminCard>
            <AdminCardHeader title="Stay details" />
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Row label="Check-in" value={formatFullDate(reservation.checkIn)} />
              <Row label="Check-out" value={formatFullDate(reservation.checkOut)} />
              <Row label="Length of stay" value={`${reservation.nights} nights`} />
              <Row
                label="Guests"
                value={`${reservation.adults} adults${
                  reservation.children ? ` · ${reservation.children} children` : ""
                }`}
              />
              <Row label="Rooms" value={reservation.rooms} />
              <Row label="Room category" value={reservation.roomCategory} />
              <Row
                label="Assigned room"
                value={
                  reservation.assignedRoom ? (
                    `Room ${reservation.assignedRoom}`
                  ) : (
                    <span className="text-muted-foreground">Room not assigned</span>
                  )
                }
              />
              <Row label="Bed type" value={reservation.bedType} />
              <Row label="Rate / night" value={formatTzs(reservation.nightlyRate)} />
              <Row label="Max occupancy" value={`${reservation.maxOccupancy} guests`} />
              <Row label="Booking source" value={reservation.source} />
              <Row
                label="Room requirements"
                value={reservation.roomRequirements ?? "None recorded"}
              />
            </dl>
            {!reservation.assignedRoom && reservation.status !== "Cancelled" ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-secondary/30 p-4">
                <p className="text-sm text-muted-foreground">
                  <BedDouble className="mr-2 inline size-4" aria-hidden="true" />
                  Room not assigned — only available, clean rooms can be assigned.
                </p>
                <Button size="sm" variant="outline">
                  Assign Room
                </Button>
              </div>
            ) : null}
          </AdminCard>

          {/* Hotel services */}
          <AdminCard>
            <AdminCardHeader
              title="Hotel services"
              description="Services the guest added to this stay."
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/hotel/$" params={{ _splat: "services/bookings" }}>
                    View All Services
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
            {reservation.services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services added to this stay yet.</p>
            ) : (
              <ul className="grid gap-3">
                {reservation.services.map((service) => (
                  <li
                    key={service.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.category} · {formatFullDate(service.date)}
                        {service.time ? ` · ${service.time}` : ""} · Qty {service.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">{formatTzs(service.price)}</span>
                      <Badge
                        variant="outline"
                        className={cn("font-medium", serviceStatusTone[service.status])}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Button size="sm" variant="outline">
                Add Service
              </Button>
            </div>
          </AdminCard>

          {/* Guest requests */}
          <AdminCard>
            <AdminCardHeader
              title="Guest requests"
              description="Non-chargeable requests raised by the guest."
            />
            {reservation.requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No guest requests on this booking.</p>
            ) : (
              <ul className="grid gap-3">
                {reservation.requests.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/70 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{request.label}</p>
                      <p className="text-xs text-muted-foreground">{request.detail}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("font-medium", requestStatusTone[request.status])}
                    >
                      {request.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* Internal notes */}
          <AdminCard>
            <AdminCardHeader
              title="Internal notes"
              description="Staff-only — never shown to the guest."
            />
            <div className="grid gap-3">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Add an operational note for the team"
                aria-label="Add internal note"
                rows={3}
              />
              <div>
                <Button size="sm" onClick={addNote} disabled={!draft.trim()}>
                  Add note
                </Button>
              </div>
            </div>
            {notes.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-xl border border-border/70 p-4">
                    <p className="text-sm text-foreground">{note.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.author} · {note.at}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No internal notes yet.</p>
            )}
          </AdminCard>

          {/* Payment activity */}
          <AdminCard>
            <AdminCardHeader
              title="Payment activity"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/hotel/$" params={{ _splat: "finance/payments" }}>
                    View Payment History
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
            <ul className="grid gap-3">
              {reservation.payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatTzs(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFullDate(payment.date)} · {payment.detail} · {payment.reference}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", paymentStatusTone[payment.status])}
                  >
                    {payment.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </AdminCard>

          {/* Activity */}
          <AdminCard>
            <AdminCardHeader title="Reservation activity" />
            <ol className="grid gap-4">
              {reservation.activity.map((event) => {
                const Icon = event.icon;
                return (
                  <li key={event.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-nbc-royal/10 text-nbc-royal"
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.at}
                        {event.actor ? ` · ${event.actor}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </AdminCard>
        </div>

        {/* Sidebar */}
        <div className="grid gap-6 self-start">
          <AdminCard>
            <AdminCardHeader title="Guest" />
            <dl className="grid gap-3">
              <Row label="Full name" value={reservation.guest.name} />
              <Row
                label="Phone"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {reservation.guest.phone}
                  </span>
                }
              />
              <Row
                label="Email"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    {reservation.guest.email}
                  </span>
                }
              />
              <Row label="Nationality" value={reservation.guest.nationality} />
              <Row
                label="NBC membership"
                value={reservation.guest.membership ?? "Not an NBC member"}
              />
              <Row label="Previous stays" value={reservation.guest.previousStays} />
            </dl>
            <Button variant="ghost" size="sm" className="mt-3 px-0" asChild>
              <Link to="/hotel/$" params={{ _splat: `guests/${reservation.guest.id}` }}>
                View Guest Profile
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader title="Payment summary" />
            <dl className="grid gap-3">
              <Row label="Reservation total" value={formatTzs(reservation.total)} />
              <Row label="Amount paid" value={formatTzs(reservation.amountPaid)} />
              <Row label="Remaining balance" value={formatTzs(Math.max(0, balance))} />
              <Row
                label="Payment status"
                value={
                  <Badge
                    variant="outline"
                    className={cn("font-medium", paymentStatusTone[reservation.paymentStatus])}
                  >
                    {reservation.paymentStatus}
                  </Badge>
                }
              />
              <Row label="Payment channel" value={reservation.paymentDetail} />
              <Row label="Transaction reference" value={reservation.transactionReference ?? "—"} />
            </dl>
            <Button variant="ghost" size="sm" className="mt-3 px-0" asChild>
              <Link to="/hotel/$" params={{ _splat: "finance" }}>
                View Payment Details
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </AdminCard>
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this reservation?</DialogTitle>
            <DialogDescription>
              This releases the room inventory and notifies the guest.
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 rounded-xl border border-border/70 p-4">
            <Row label="Reference" value={reservation.reference} />
            <Row label="Guest" value={reservation.guest.name} />
            <Row
              label="Dates"
              value={`${formatFullDate(reservation.checkIn)} → ${formatFullDate(reservation.checkOut)}`}
            />
            <Row label="Current amount" value={formatTzs(reservation.total)} />
            <Row
              label="Cancellation policy"
              value="Free cancellation up to 48 hours before check-in; the first night is charged within 48 hours."
            />
            <Row
              label="Refund implication"
              value={
                reservation.amountPaid > 0
                  ? `${formatTzs(reservation.amountPaid)} paid — refund reviewed by finance.`
                  : "No payment received — nothing to refund."
              }
            />
          </dl>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep reservation
            </Button>
            <Button
              className="bg-nbc-scarlet text-primary-foreground hover:bg-nbc-scarlet/90"
              onClick={() => setCancelOpen(false)}
            >
              Cancel reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HotelAdminLayout>
  );
}
