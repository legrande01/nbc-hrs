import { useMemo } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { BookingStepper } from "@/components/nbc/BookingStepper";
import { ReservationReview } from "@/components/nbc/ReservationReview";
import { ReservationOwnerForm } from "@/components/nbc/ReservationOwnerForm";
import { useBookingFlow, type ReservationOwner } from "@/lib/nbc-booking-flow";
import { getRoomSelectionData, parseRoomSelectionSearch } from "@/lib/nbc-room-selection";

export const Route = createFileRoute("/hotels/$hotelId_/reservation")({
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
          { title: "Reservation Unavailable — NBC Hospitality" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Reservation Details — ${loaderData.name} | NBC Hospitality`;
    const description = `Provide your contact and traveller details to complete your reservation at ${loaderData.name}.`;
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
      We could not find that reservation.
    </div>
  ),
  component: ReservationDetailsPage,
});

function ReservationDetailsPage() {
  const { hotelId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, updateOwner } = useBookingFlow();

  const initialOwner = useMemo<ReservationOwner>(
    () => ({
      fullName: session?.owner?.fullName ?? profile.fullName,
      email: session?.owner?.email ?? profile.email,
      phone: session?.owner?.phone ?? profile.phone,
      country: session?.owner?.country ?? profile.country,
      preferredLanguage: session?.owner?.preferredLanguage ?? profile.preferredLanguage,
      arrivalTime: session?.owner?.arrivalTime ?? "",
      specialRequests: session?.owner?.specialRequests ?? "",
    }),
    [session, profile],
  );

  const validSession = session && session.propertyId === hotelId && session.roomLines.length > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <section className="border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
            <Button variant="ghost" size="sm" asChild className="-ml-3 gap-2 text-muted-foreground">
              <Link to="/hotels/$hotelId/rooms" params={{ hotelId }} search={search}>
                <ArrowLeft aria-hidden="true" />
                Back to room selection
              </Link>
            </Button>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Reservation details
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Tell us who the reservation is for. Only the reservation owner's details are needed
              now — the hotel completes guest registration at check-in.
            </p>

            <BookingStepper current="reservation" className="mt-8" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          {validSession ? (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <ReservationOwnerForm initial={initialOwner} onChange={handleOwnerChange} />
              <ReservationReview
                className="lg:sticky lg:top-24"
                session={session}
                modifiable
                action={{
                  label: "Continue to Payment",
                  disabled: !ownerValid,
                  onClick: () => {
                    if (!ownerValid) return;
                    updateOwner(draft);
                    navigate({
                      to: "/hotels/$hotelId/payment",
                      params: { hotelId },
                      search,
                    });
                  },
                }}
                actionHint={
                  ownerValid
                    ? undefined
                    : "Complete your contact and traveller details to continue."
                }
              />
            </div>

          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Your room selection has expired
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We no longer hold rooms for this session. Choose your rooms again to continue with
                your reservation.
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
