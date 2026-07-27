import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Clock, Download, Mail, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { BookingStepper } from "@/components/nbc/BookingStepper";
import { ReservationReview } from "@/components/nbc/ReservationReview";
import { ComplianceNotice } from "@/components/nbc/ComplianceNotice";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { getRoomSelectionData, parseRoomSelectionSearch } from "@/lib/nbc-room-selection";
import { useBookingFlow } from "@/lib/nbc-booking-flow";
import {
  CONFIRMATION_HEADLINES,
  CONFIRMATION_SUBLINES,
  formatOutcomeDate,
  type PaymentOutcome,
} from "@/lib/nbc-payments";

export const Route = createFileRoute("/hotels/$hotelId_/confirmation")({
  validateSearch: (search: Record<string, unknown>) => parseRoomSelectionSearch(search),
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
    const description = `Your reservation at ${loaderData.name} is confirmed. View your booking reference, payment status and next steps.`;
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function PaymentOutcomeDetails({ outcome }: { outcome: PaymentOutcome }) {
  const { currency } = outcome;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
      <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Payment</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
        {outcome.method.name}
      </h2>

      <div className="mt-4 grid">
        <DetailRow label="Amount" value={formatPrice(outcome.amount, currency)} />
        <DetailRow
          label="Status"
          value={
            outcome.status === "paid"
              ? "Paid in full"
              : outcome.status === "financed"
                ? "Financed by NBC"
                : "Awaiting payment"
          }
        />
        <DetailRow label="Date" value={formatOutcomeDate(outcome.paidAt)} />

        {outcome.instalments ? (
          <>
            <DetailRow
              label="Instalment plan"
              value={`${outcome.instalments.count} months × ${formatPrice(outcome.instalments.monthly, currency)}`}
            />
            <DetailRow
              label="First payment due"
              value={formatOutcomeDate(outcome.instalments.firstDue)}
            />
          </>
        ) : null}

        {outcome.savings ? (
          <>
            <DetailRow label="Savings goal" value={outcome.savings.goalName} />
            <DetailRow
              label="Remaining in goal"
              value={formatPrice(outcome.savings.remaining, currency)}
            />
          </>
        ) : null}

        {outcome.loyalty ? (
          <>
            <DetailRow
              label="Points redeemed"
              value={outcome.loyalty.pointsRedeemed.toLocaleString("en-GB")}
            />
            <DetailRow
              label="Points remaining"
              value={outcome.loyalty.pointsRemaining.toLocaleString("en-GB")}
            />
          </>
        ) : null}

        {outcome.controlNumber ? (
          <>
            <DetailRow label="Control number" value={outcome.controlNumber.number} />
            <DetailRow label="Pay before" value={formatOutcomeDate(outcome.controlNumber.dueBy)} />
          </>
        ) : null}

        {outcome.phone ? <DetailRow label="Mobile money number" value={outcome.phone} /> : null}
        {outcome.cardLast4 ? <DetailRow label="Card" value={`•••• ${outcome.cardLast4}`} /> : null}
      </div>
    </div>
  );
}

function ConfirmationPage() {
  const { hotelId } = Route.useParams();
  const search = Route.useSearch();
  const { session, resendConfirmationEmail } = useBookingFlow();
  const [sending, setSending] = useState(false);

  const outcome = session?.paymentOutcome;
  const confirmed = session && outcome && session.propertyId === hotelId;

  async function resend() {
    setSending(true);
    await resendConfirmationEmail();
    setSending(false);
    toast.success(
      session?.owner?.email
        ? `Confirmation sent again to ${session.owner.email}.`
        : "Confirmation email sent again.",
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.07} />
          <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            {confirmed ? (
              <>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-nbc-gold">
                  {outcome.status === "pending" ? (
                    <Clock aria-hidden="true" className="size-3.5" />
                  ) : (
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                  )}
                  Booking {outcome.reference}
                </span>
                <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  {CONFIRMATION_HEADLINES[outcome.method.id]}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/75">
                  {CONFIRMATION_SUBLINES[outcome.method.id]}
                </p>
              </>
            ) : (
              <h1 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
                No confirmation to show
              </h1>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <BookingStepper current="confirmation" className="mb-10" />

          {confirmed ? (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid gap-8">
                <PaymentOutcomeDetails outcome={outcome} />

                {session.owner ? (
                  <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                    <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">
                      Reservation Owner
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      {session.owner.fullName}
                    </h2>
                    <div className="mt-4 grid">
                      <DetailRow label="Email" value={session.owner.email} />
                      <DetailRow label="Phone" value={session.owner.phone} />
                      <DetailRow label="Country" value={session.owner.country} />
                      <DetailRow
                        label="Preferred language"
                        value={session.owner.preferredLanguage === "sw" ? "Kiswahili" : "English"}
                      />
                      {session.owner.arrivalTime ? (
                        <DetailRow label="Estimated arrival" value={session.owner.arrivalTime} />
                      ) : null}
                      {session.owner.specialRequests ? (
                        <DetailRow
                          label="Special requests"
                          value={session.owner.specialRequests}
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <ComplianceNotice />

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={resend} disabled={sending} className="gap-2">
                    <Mail aria-hidden="true" />
                    {sending ? "Sending…" : "Email booking confirmation again"}
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Printer aria-hidden="true" />
                    Print confirmation
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                    <Download aria-hidden="true" />
                    Download PDF
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="scarlet" size="lg" asChild>
                    <Link to="/hotels">Explore more stays</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/hotels/$hotelId" params={{ hotelId }} search={search}>
                      Back to property
                    </Link>
                  </Button>
                </div>
              </div>

              <ReservationReview className="lg:sticky lg:top-24" session={session} />
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
