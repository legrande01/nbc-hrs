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
    <div>
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
  const [processing, setProcessing] = useState(false);
  const [details, setDetails] = useState<PaymentDetailsState>({
    phone: session?.owner?.phone ?? "",
    cardNumber: "",
    cardName: session?.owner?.fullName ?? "",
    cardExpiry: "",
    cardCvc: "",
    instalments: 3,
    carrier: "M-Pesa",
  });

  const exclusive = useMemo(() => methodsInGroup("nbc-exclusive"), []);
  const everyone = useMemo(() => methodsInGroup("everyone"), []);

  const valid = session && session.propertyId === hotelId && session.roomLines.length > 0;
  const total = session?.pricing.total ?? 0;
  const currency = session?.pricing.currency ?? "TZS";
  const selectedMethod = selected ? getPaymentMethod(selected) : undefined;

  function setDetail<K extends keyof PaymentDetailsState>(key: K, value: PaymentDetailsState[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function finalize() {
    if (!session || !selectedMethod) return;
    setProcessing(true);
    selectPayment(selectedMethod.id);
    const outcome = buildPaymentOutcome({
      method: selectedMethod,
      amount: total,
      currency,
      profile,
      phone: selectedMethod.id === "mobile-money" ? details.phone : undefined,
      cardLast4:
        selectedMethod.id === "card"
          ? details.cardNumber.replace(/\D/g, "").slice(-4)
          : undefined,
      instalmentCount: details.instalments,
    });
    confirmSession(outcome);
    navigate({ to: "/hotels/$hotelId/confirmation", params: { hotelId }, search });
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
              <div className="grid gap-8">
                <div className="grid gap-8 rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8">
                  <div>
                    <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Step A</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Choose Payment Method
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    <GroupHeading
                      title="NBC Exclusive"
                      description="Flexible ways to pay, available to NBC customers."
                    />
                    {!nbcAccountLinked ? <LinkNbcAccountCard onLink={linkNbcAccount} /> : null}
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {exclusive.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          selected={selected === method.id}
                          eligible={isMethodEligible(method, profile, nbcAccountLinked)}
                          onSelect={() => setSelected(method.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <GroupHeading
                      title="Available to Everyone"
                      description="Standard payment options for all guests."
                    />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {everyone.map((method) => (
                        <PaymentMethodCard
                          key={method.id}
                          method={method}
                          selected={selected === method.id}
                          eligible
                          onSelect={() => setSelected(method.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <PaymentDetailsPanel
                  method={selectedMethod}
                  profile={profile}
                  total={total}
                  currency={currency}
                  value={details}
                  onChange={setDetail}
                />
              </div>

              <ReservationReview
                className="lg:sticky lg:top-24"
                session={session}
                modifiable
                action={{
                  label: processing ? "Processing…" : "Finalize Payment",
                  disabled: !selectedMethod || processing,
                  onClick: finalize,
                }}
                actionHint={
                  selectedMethod
                    ? undefined
                    : "Select a payment method to finalize your reservation."
                }
              />
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

