import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { BookingStepper } from "@/components/nbc/BookingStepper";
import { ComplianceNotice } from "@/components/nbc/ComplianceNotice";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import {
  formatStayDate,
  getRoomSelectionData,
  parseRoomSelectionSearch,
} from "@/lib/nbc-room-selection";
import { useBookingFlow, type BookingSession } from "@/lib/nbc-booking-flow";
import { CONFIRMATION_STATUS_LABELS, type PaymentOutcome } from "@/lib/nbc-payments";
import { persistReservation } from "@/lib/reservations.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/hotels/$hotelId_/confirmation")({
  validateSearch: (search: Record<string, unknown> | undefined) => parseRoomSelectionSearch(search ?? {}),
  loader: ({ params }) => {
    const data = getRoomSelectionData(params.hotelId);
    if (!data) throw notFound();
    return { name: data.property.hotel.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Confirmation Unavailable — NBC Hospitality" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Booking Confirmation — ${loaderData.name} | NBC Hospitality`;
    const description = `Your reservation at ${loaderData.name} is confirmed. View your booking reference, payment status and stay details.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-16 text-center text-muted-foreground">
      We could not find that confirmation.
    </div>
  ),
  component: ConfirmationPage,
});

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-4 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

/** Plain-text confirmation document. A PDF service replaces this later. */
function buildConfirmationDocument(session: BookingSession, outcome: PaymentOutcome): string {
  const lines = [
    "NBC HOSPITALITY — BOOKING CONFIRMATION",
    "",
    `Booking reference: ${outcome.reference}`,
    `Hotel: ${session.propertyName}`,
    `Stay dates: ${formatStayDate(session.stay.checkIn)} – ${formatStayDate(session.stay.checkOut)} (${session.nights} night(s))`,
    `Guests: ${session.stay.adults} adult(s)${session.stay.children > 0 ? `, ${session.stay.children} child(ren)` : ""}`,
    `Rooms: ${session.roomLines.map((line) => `${line.quantity} × ${line.roomName}`).join(", ")}`,
    `Reservation owner: ${session.owner?.fullName ?? "—"}`,
    `Payment method: ${outcome.method.name}`,
    `Payment status: ${CONFIRMATION_STATUS_LABELS[outcome.method.id]}`,
    `${outcome.status === "pending" ? "Total pending" : "Total paid"}: ${formatPrice(outcome.amount, outcome.currency)}`,
  ];
  if (outcome.controlNumber) lines.push(`Control number: ${outcome.controlNumber.number}`);
  lines.push(
    "",
    "All staying guests must present a valid government-issued ID at check-in.",
  );
  return lines.join("\n");
}

function ConfirmationPage() {
  const { session } = useBookingFlow();
  const { hotelId } = Route.useParams();

  const outcome = session?.paymentOutcome;
  const confirmed = session && outcome && session.propertyId === hotelId;
  const persisted = useRef<string | null>(null);

  // Persist the reservation once, so it can be recovered by reference later.
  useEffect(() => {
    if (!session || !outcome || !session.owner) return;
    if (persisted.current === outcome.reference) return;
    persisted.current = outcome.reference;

    void (async () => {
      const { data } = await supabase.auth.getUser();
      await persistReservation({
        data: {
          reference: outcome.reference,
          userId: data.user?.id ?? null,
          hotelId: session.propertyId,
          hotelName: session.propertyName,
          guestName: session.owner!.fullName,
          guestEmail: session.owner!.email,
          guestPhone: session.owner!.phone,
          checkIn: session.stay.checkIn,
          checkOut: session.stay.checkOut,
          adults: session.stay.adults,
          children: session.stay.children,
          rooms: session.roomLines.map((line) => ({
            roomId: line.roomId,
            roomName: line.roomName,
            quantity: line.quantity,
            nightlyRate: line.nightlyRate,
            subtotal: line.subtotal,
          })),
          currency: outcome.currency,
          totalAmount: outcome.amount,
          paymentMethod: outcome.method.name,
          paymentStatus: outcome.status,
          statusLabel: CONFIRMATION_STATUS_LABELS[outcome.method.id],
        },
      }).catch(() => {
        persisted.current = null;
      });
    })();
  }, [session, outcome]);

  function download() {
    if (!session || !outcome) return;
    const blob = new Blob([buildConfirmationDocument(session, outcome)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `NBC-Booking-${outcome.reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Your booking confirmation has been downloaded.");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.07} />
          <div className="relative mx-auto max-w-3xl px-5 py-20 text-center lg:px-8 lg:py-24">
            {confirmed ? (
              <>
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-foreground/10 text-nbc-gold">
                  {outcome.status === "pending" ? (
                    <Clock aria-hidden="true" className="size-8" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle2 aria-hidden="true" className="size-8" strokeWidth={1.5} />
                  )}
                </span>
                <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  Reservation Confirmed
                </h1>
                <p className="nbc-eyebrow mt-8 text-[0.625rem] text-primary-foreground/60">
                  Booking Reference
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[0.14em] text-nbc-gold sm:text-3xl">
                  {outcome.reference}
                </p>
              </>
            ) : (
              <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                No confirmation to show
              </h1>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
          <BookingStepper current="confirmation" className="mb-12" />

          {confirmed ? (
            <div className="grid gap-8">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8">
                <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Booking Summary</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {session.propertyName}
                </h2>

                <div className="mt-5 grid">
                  <SummaryRow
                    label="Stay dates"
                    value={`${formatStayDate(session.stay.checkIn)} – ${formatStayDate(
                      session.stay.checkOut,
                    )} · ${session.nights} ${session.nights === 1 ? "night" : "nights"}`}
                  />
                  <SummaryRow
                    label="Guests"
                    value={`${session.stay.adults} ${
                      session.stay.adults === 1 ? "adult" : "adults"
                    }${
                      session.stay.children > 0
                        ? `, ${session.stay.children} ${
                            session.stay.children === 1 ? "child" : "children"
                          }`
                        : ""
                    }`}
                  />
                  <SummaryRow
                    label="Room category"
                    value={session.roomLines
                      .map((line) => `${line.quantity} × ${line.roomName}`)
                      .join(", ")}
                  />
                  <SummaryRow
                    label="Reservation owner"
                    value={session.owner?.fullName ?? "—"}
                  />
                  <SummaryRow label="Payment method" value={outcome.method.name} />
                  <SummaryRow
                    label="Payment status"
                    value={CONFIRMATION_STATUS_LABELS[outcome.method.id]}
                  />
                  {outcome.controlNumber ? (
                    <SummaryRow label="Control number" value={outcome.controlNumber.number} />
                  ) : null}
                  <div className="flex flex-wrap items-baseline justify-between gap-3 pt-5">
                    <span className="text-sm font-semibold text-foreground">
                      {outcome.status === "pending" ? "Total pending" : "Total paid"}
                    </span>
                    <span className="text-2xl font-semibold tracking-tight text-nbc-royal">
                      {formatPrice(outcome.amount, outcome.currency)}
                    </span>
                  </div>
                </div>
              </div>

              <ComplianceNotice />

              <div>
                <Button size="xl" className="gap-2" onClick={download}>
                  <Download aria-hidden="true" />
                  Download Booking Confirmation
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-8">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/">Return home</Link>
                </Button>
                <Button variant="scarlet" size="lg" asChild>
                  <Link to="/hotels">Explore more hotels</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
              <p className="text-sm leading-relaxed text-muted-foreground">
                We could not find a confirmed reservation for this session. If you have already
                booked, check your email for your confirmation.
              </p>
              <Button variant="scarlet" size="lg" asChild className="mt-6">
                <Link to="/hotels">Browse hotels</Link>
              </Button>
            </div>
          )}
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
