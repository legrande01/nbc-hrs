import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findReservationSchema } from "@/lib/auth-schemas";
import { lookupReservation } from "@/lib/reservations.functions";
import type { ReservationRecord } from "@/lib/reservations.server";

export const Route = createFileRoute("/find-reservation")({
  head: () => ({
    meta: [
      { title: "Find my reservation · NBC Hospitality" },
      {
        name: "description",
        content:
          "Look up an NBC Hospitality hotel reservation using your booking reference and the email address or phone number used to book.",
      },
      { property: "og:title", content: "Find my reservation · NBC Hospitality" },
      {
        property: "og:description",
        content: "Retrieve your booking details without signing in.",
      },
    ],
  }),
  component: FindReservationPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReservationResult({ reservation }: { reservation: ReservationRecord }) {
  return (
    <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
      <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Reservation found</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">{reservation.hotelName}</h2>
      {reservation.hotelLocation ? (
        <p className="text-sm text-muted-foreground">{reservation.hotelLocation}</p>
      ) : null}

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Reference</dt>
          <dd className="text-sm font-semibold text-foreground">{reservation.reference}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Guest</dt>
          <dd className="text-sm font-semibold text-foreground">{reservation.guestName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Check-in</dt>
          <dd className="text-sm font-semibold text-foreground">
            {formatDate(reservation.checkIn)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Check-out</dt>
          <dd className="text-sm font-semibold text-foreground">
            {formatDate(reservation.checkOut)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Guests</dt>
          <dd className="text-sm font-semibold text-foreground">
            {reservation.adults} adults · {reservation.children} children
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total</dt>
          <dd className="text-sm font-semibold text-foreground">
            {reservation.currency} {reservation.totalAmount.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment</dt>
          <dd className="text-sm font-semibold text-foreground">
            {reservation.statusLabel ?? reservation.paymentStatus}
          </dd>
        </div>
      </dl>

      {reservation.rooms.length ? (
        <ul className="mt-5 grid gap-2 border-t border-border/70 pt-4">
          {reservation.rooms.map((room) => (
            <li key={room.roomId} className="flex justify-between gap-4 text-sm">
              <span className="text-foreground">
                {room.quantity} × {room.roomName}
              </span>
              <span className="text-muted-foreground">
                {reservation.currency} {room.subtotal.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FindReservationPage() {
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationRecord | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setReservation(null);

    const parsed = findReservationSchema.safeParse({ reference, contact });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }

    setBusy(true);
    try {
      const result = await lookupReservation({ data: parsed.data });
      if (!result.reservation) {
        setError(
          "We could not find a reservation with those details. Check the reference and the contact used when booking.",
        );
        return;
      }
      setReservation(result.reservation as ReservationRecord);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Lookup failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Guest Services"
      title="Find my reservation"
      description="Booked without an account? Enter your booking reference together with the email address or phone number used at checkout."
      footer={
        <p className="text-sm text-muted-foreground">
          Have an account?{" "}
          <Link
            to="/account/login"
            search={{ next: "/account" }}
            className="font-medium text-nbc-royal hover:underline"
          >
            Sign in to see all your reservations
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <div className="grid gap-2">
            <Label htmlFor="reference">Booking reference</Label>
            <Input
              id="reference"
              placeholder="NBC-XXXXXX"
              value={reference}
              onChange={(event) => setReference(event.target.value.toUpperCase())}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact">Email address or phone number</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-nbc-scarlet">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
            {busy ? "Searching…" : "Find reservation"}
          </Button>
        </AuthCard>
      </form>

      {reservation ? <ReservationResult reservation={reservation} /> : null}
    </AuthShell>
  );
}
