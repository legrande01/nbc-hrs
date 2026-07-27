import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { BookingStepper } from "@/components/nbc/BookingStepper";
import { ReservationReview } from "@/components/nbc/ReservationReview";
import { PaymentMethodCard } from "@/components/nbc/PaymentMethodCard";
import { LinkNbcAccountCard } from "@/components/nbc/LinkNbcAccountCard";
import {
  PaymentDetailsPanel,
  type PaymentDetailsState,
} from "@/components/nbc/PaymentDetailsPanel";
import { getRoomSelectionData, parseRoomSelectionSearch } from "@/lib/nbc-room-selection";
import { useBookingFlow } from "@/lib/nbc-booking-flow";
import {
  buildPaymentOutcome,
  getPaymentMethod,
  isMethodEligible,
  methodsInGroup,
  type PaymentMethodId,
} from "@/lib/nbc-payments";


export const Route = createFileRoute("/hotels/$hotelId_/payment")({
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
          { title: "Payment Unavailable — NBC Hospitality" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Payment — ${loaderData.name} | NBC Hospitality`;
    const description = `Choose how to pay for your stay at ${loaderData.name}, including NBC exclusive ways to pay.`;
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
    <div className="p-16 text-center text-muted-foreground">We could not find that payment.</div>
  ),
  component: PaymentPage,
});

function GroupHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PaymentPage() {
  const { hotelId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, nbcAccountLinked, linkNbcAccount, selectPayment, confirmSession } =
    useBookingFlow();

  const [selected, setSelected] = useState<PaymentMethodId | undefined>(session?.paymentMethodId);
  const [phone, setPhone] = useState(session?.owner?.phone ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [instalments, setInstalments] = useState(3);
  const [processing, setProcessing] = useState(false);

  const exclusive = useMemo(() => methodsInGroup("nbc-exclusive"), []);
  const everyone = useMemo(() => methodsInGroup("everyone"), []);

  const valid = session && session.propertyId === hotelId && session.roomLines.length > 0;
  const total = session?.pricing.total ?? 0;
  const currency = session?.pricing.currency ?? "TZS";

  function confirm(method: PaymentMethod) {
    if (!session) return;
    setProcessing(true);
    selectPayment(method.id);
    const outcome = buildPaymentOutcome({
      method,
      amount: total,
      currency,
      profile,
      phone: method.id === "mobile-money" ? phone : undefined,
      cardLast4: method.id === "card" ? cardNumber.replace(/\D/g, "").slice(-4) : undefined,
      instalmentCount: instalments,
    });
    confirmSession(outcome);
    navigate({ to: "/hotels/$hotelId/confirmation", params: { hotelId }, search });
  }

  function renderPanel(method: PaymentMethod) {
    const eligible = isMethodEligible(method, profile, nbcAccountLinked);
    if (!eligible) return null;

    return (
      <div className="grid gap-5">
        {method.id === "bnpl" ? (
          <div className="grid gap-3">
            <Label htmlFor="instalments">Instalment plan</Label>
            <div className="flex flex-wrap gap-2">
              {[3, 6, 12].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setInstalments(count)}
                  aria-pressed={instalments === count}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    instalments === count
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {count} months
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPrice(Math.round(total / instalments), currency)} per month · first payment
              due next month.
            </p>
          </div>
        ) : null}

        {method.id === "save-to-buy" && profile.savingsGoal ? (
          <div className="grid gap-1.5">
            <p className="text-sm font-medium text-foreground">{profile.savingsGoal.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatPrice(profile.savingsGoal.saved, currency)} saved of{" "}
              {formatPrice(profile.savingsGoal.target, currency)}. This reservation draws{" "}
              {formatPrice(total, currency)}.
            </p>
          </div>
        ) : null}

        {method.id === "loyalty-points" ? (
          <p className="text-sm text-muted-foreground">
            You have {profile.loyaltyPoints.toLocaleString("en-GB")} points. This reservation
            redeems {Math.round(total / profile.loyaltyPointValue).toLocaleString("en-GB")} points.
          </p>
        ) : null}

        {method.id === "mobile-money" ? (
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="momo-phone">Mobile money number</Label>
            <Input
              id="momo-phone"
              type="tel"
              placeholder="+255 700 000 000"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You will receive a USSD push to approve the payment.
            </p>
          </div>
        ) : null}

        {method.id === "card" ? (
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input
              id="card-number"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Card details are placeholders in this preview build.
            </p>
          </div>
        ) : null}

        {method.id === "control-number" ? (
          <p className="text-sm text-muted-foreground">
            We will generate a control number and hold your rooms for 48 hours. Pay at any NBC
            branch, agent or through your bank app.
          </p>
        ) : null}

        <div>
          <Button size="lg" disabled={processing} onClick={() => confirm(method)}>
            {method.cta} · {formatPrice(total, currency)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
            <Button variant="ghost" size="sm" asChild className="-ml-3 gap-2 text-muted-foreground">
              <Link to="/hotels/$hotelId/reservation" params={{ hotelId }} search={search}>
                <ArrowLeft aria-hidden="true" />
                Back to reservation details
              </Link>
            </Button>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              How would you like to pay?
            </h1>
            <p className="mt-3 flex max-w-2xl items-center gap-2 text-base leading-relaxed text-muted-foreground">
              <Lock aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
              Every payment is secured and processed by NBC.
            </p>

            <BookingStepper current="payment" className="mt-8" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          {valid ? (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid gap-12">
                <div>
                  <GroupHeading
                    title="NBC Exclusive Ways to Pay"
                    description="Flexible options available to NBC customers."
                  />
                  {!nbcAccountLinked ? (
                    <LinkNbcAccountCard className="mb-5" onLink={linkNbcAccount} />
                  ) : null}
                  <div className="grid gap-4">
                    {exclusive.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        selected={selected === method.id}
                        eligible={isMethodEligible(method, profile, nbcAccountLinked)}
                        onSelect={() => setSelected(method.id)}
                      >
                        {renderPanel(method)}
                      </PaymentMethodCard>
                    ))}
                  </div>
                </div>

                <div>
                  <GroupHeading
                    title="Available to Everyone"
                    description="Standard payment options for all guests."
                  />
                  <div className="grid gap-4">
                    {everyone.map((method) => (
                      <PaymentMethodCard
                        key={method.id}
                        method={method}
                        selected={selected === method.id}
                        eligible
                        onSelect={() => setSelected(method.id)}
                      >
                        {renderPanel(method)}
                      </PaymentMethodCard>
                    ))}
                  </div>
                </div>
              </div>

              <ReservationReview className="lg:sticky lg:top-24" session={session} modifiable />
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                There is nothing to pay for yet
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Your reservation session has ended. Select your rooms again to continue.
              </p>
              <Button variant="scarlet" size="lg" asChild className="mt-6">
                <Link to="/hotels/$hotelId/rooms" params={{ hotelId }} search={search}>
                  Choose your rooms
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
