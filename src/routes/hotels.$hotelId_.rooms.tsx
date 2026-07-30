import { useCallback, useMemo, useState } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { SectionHeading } from "@/components/nbc/SectionHeading";
import { BookingSummaryBar } from "@/components/nbc/BookingSummaryBar";
import { RoomCategoryCard } from "@/components/nbc/RoomCategoryCard";
import { ReservationSummary } from "@/components/nbc/ReservationSummary";
import { useBookingFlow } from "@/lib/nbc-booking-flow";
import {
  buildTotals,
  checkOccupancy,
  getRoomSelectionData,
  isCompleteStay,
  nightsBetween,
  parseRoomSelectionSearch,
} from "@/lib/nbc-room-selection";

export const Route = createFileRoute("/hotels/$hotelId_/rooms")({
  validateSearch: (search: Record<string, unknown>) => parseRoomSelectionSearch(search),
  /**
   * Defensive guard only. In the normal journey Hotel Details always collects
   * availability before navigating here, so this never fires.
   */
  beforeLoad: ({ params, search }) => {
    if (!isCompleteStay(search)) {
      throw redirect({
        to: "/hotels/$hotelId",
        params: { hotelId: params.hotelId },
        search,
      });
    }
  },
  loader: ({ params }) => {

    const data = getRoomSelectionData(params.hotelId);
    if (!data) throw notFound();
    return { name: data.property.hotel.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Rooms Unavailable — NBC Hospitality" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Choose Your Room — ${loaderData.name} | NBC Hospitality`;
    const description = `Compare available room categories, rates, inclusions and promotions at ${loaderData.name}, then build your reservation.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="p-16 text-center text-muted-foreground">
      We could not find rooms for that property.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-16 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  component: RoomSelectionPage,
});

function RoomSelectionPage() {
  const { hotelId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { startSession } = useBookingFlow();

  const data = useMemo(() => getRoomSelectionData(hotelId), [hotelId]);
  const [selection, setSelection] = useState<Record<string, number>>({});

  const nights = nightsBetween(search.checkIn, search.checkOut);


  const increment = useCallback((roomId: string) => {
    setSelection((prev) => ({ ...prev, [roomId]: (prev[roomId] ?? 0) + 1 }));
  }, []);

  const decrement = useCallback((roomId: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      const quantity = (next[roomId] ?? 0) - 1;
      if (quantity <= 0) delete next[roomId];
      else next[roomId] = quantity;
      return next;
    });
  }, []);

  const clear = useCallback((roomId: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const continueReservation = useCallback(() => {
    if (!data) return;
    const selectionTotals = buildTotals(data.categories, selection, nights);
    if (selectionTotals.roomCount === 0) {
      toast.error("Select at least one room category to continue.");
      return;
    }
    startSession({
      propertyId: hotelId,
      propertyName: data.property.hotel.name,
      stay: search,
      nights,
      totals: selectionTotals,
      currency: data.property.hotel.currency,
    });
    navigate({ to: "/hotels/$hotelId/reservation", params: { hotelId }, search });
  }, [data, selection, nights, startSession, hotelId, search, navigate]);


  if (!data) throw notFound();

  const { property, categories } = data;
  const { hotel } = property;
  const totals = buildTotals(categories, selection, nights);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        {/* Booking summary */}
        <section className="relative isolate overflow-hidden border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-12">
            <Button variant="ghost" size="sm" asChild className="-ml-3 gap-2 text-muted-foreground">
              <Link to="/hotels/$hotelId" params={{ hotelId }}>
                <ArrowLeft aria-hidden="true" />
                Back to {hotel.name}
              </Link>
            </Button>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              Choose your room
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Compare room categories for your stay. Select one category or mix several — physical
              rooms are assigned by the hotel at check-in.
            </p>



            <BookingSummaryBar
              className="mt-8"
              hotelName={hotel.name}
              search={search}
              nights={nights}
            />

          </div>
        </section>

        {/* Available room categories + live reservation summary */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Available Rooms"
            title={`${categories.length} room categories at ${hotel.name}`}
            description="Rates shown are for your selected dates and include applicable promotions."
          />

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-8">
              {categories.map((room) => (
                <RoomCategoryCard
                  key={room.id}
                  room={room}
                  currency={hotel.currency}
                  nights={nights}
                  hasDates
                  occupancy={checkOccupancy(room, search)}
                  quantity={selection[room.id] ?? 0}
                  onAdd={() => increment(room.id)}
                  onRemove={() => decrement(room.id)}
                  comparing={compareIds.includes(room.id)}
                  compareDisabled={compareIds.length >= 3}
                  onToggleCompare={() => toggleCompare(room.id)}
                  onViewDetails={() => setDetailsRoomId(room.id)}
                  onNotify={(variant) =>
                    setNotifyTarget({ id: variant.id, name: `${room.name} — ${variant.label}` })
                  }
                />
              ))}
            </div>

            <ReservationSummary
              className="lg:sticky lg:top-24"
              totals={totals}
              currency={hotel.currency}
              nights={nights}
              onIncrement={increment}
              onDecrement={decrement}
              onClear={clear}
              onContinue={continueReservation}
            />
          </div>
        </section>


        {/* Continue CTA */}
        <section className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.07} />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:py-20">
            <div className="min-w-0">
              <p className="nbc-eyebrow text-nbc-gold">Almost there</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
                Happy with your selection?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
                {totals.roomCount > 0
                  ? `${totals.roomCount} ${totals.roomCount === 1 ? "room" : "rooms"} ready to reserve at ${hotel.name}.`
                  : `Select at least one room category to continue with your stay at ${hotel.name}.`}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Button
                variant="scarlet"
                size="xl"
                disabled={totals.roomCount === 0}
                onClick={continueReservation}
              >
                Continue Reservation
              </Button>
              <Button variant="outlineOnDark" size="xl" asChild>
                <Link to="/hotels/$hotelId" params={{ hotelId }} search={search}>
                  Back to Property
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}


