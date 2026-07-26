import { useCallback, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Building2,
  ConciergeBell,
  MapPin,
  Plane,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { SectionHeading } from "@/components/nbc/SectionHeading";
import { PropertyHero } from "@/components/nbc/PropertyHero";
import { PropertyGallery } from "@/components/nbc/PropertyGallery";
import { RoomPreviewCard } from "@/components/nbc/RoomPreviewCard";
import { amenityMeta } from "@/lib/nbc-amenities";
import { getPropertyDetail } from "@/lib/nbc-property";

export const Route = createFileRoute("/hotels/$hotelId")({
  loader: ({ params }) => {
    const property = getPropertyDetail(params.hotelId);
    if (!property) throw notFound();
    return { name: property.hotel.name, positioning: property.positioning };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Property Unavailable — NBC Hospitality" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — NBC Hospitality`;
    const description = `${loaderData.positioning}. Explore amenities, photography, room categories, location and policies before you choose your room.`;
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
      We could not find that property.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-16 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  component: PropertyDetailsPage,
});

const nearbyIcons = {
  Landmark: Building2,
  Attraction: Sparkles,
  Airport: Plane,
  "Business District": Building2,
} as const;

function PropertyDetailsPage() {
  const { hotelId } = Route.useParams();
  const property = useMemo(() => getPropertyDetail(hotelId), [hotelId]);

  const scrollToRooms = useCallback(() => {
    document.getElementById("room-types")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const shareProperty = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property?.hotel.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Property link copied to your clipboard.");
    } catch {
      toast.error("We could not share this property just now.");
    }
  }, [property?.hotel.name]);

  if (!property) throw notFound();

  const { hotel } = property;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <PropertyHero hotel={hotel} onViewRooms={scrollToRooms} onShare={shareProperty} />

        {/* Property overview — description, location, highlights & amenities */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow={property.positioning}
            title="Property overview"
            description="What defines this property and everything available during your stay."
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="grid h-fit content-start gap-8 rounded-2xl border border-border/70 bg-card p-7 shadow-card">
              <div>
                <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">About This Property</h3>
                <div className="mt-4 grid gap-5">
                  {property.overview.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Property Location</h3>
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-nbc-royal">
                    <MapPin aria-hidden="true" className="size-4.5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold leading-snug text-foreground">{hotel.name}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{property.address}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Nearby Landmarks & Attractions</h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {property.nearby.map((place) => {
                    const Icon = nearbyIcons[place.kind];
                    return (
                      <li key={place.id} className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-nbc-royal">
                          <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug text-foreground">{place.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {place.kind} · {place.distance} away
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="grid h-fit gap-8 rounded-2xl border border-border/70 bg-secondary/30 p-7">
              <div>
                <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Property Highlights</h3>
                <ul className="mt-4 grid gap-3">
                  {property.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-3 text-sm text-foreground">
                      <Sparkles
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-nbc-scarlet"
                        strokeWidth={1.75}
                      />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Key Amenities & Services</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {property.serviceAmenities.map((key) => {
                    const { label, icon: Icon } = amenityMeta[key];
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-card"
                      >
                        <Icon aria-hidden="true" className="size-4 text-nbc-royal" strokeWidth={1.5} />
                        {label}
                      </li>
                    );
                  })}
                  {property.extraServices.map((service) => (
                    <li
                      key={service}
                      className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-card"
                    >
                      <ConciergeBell aria-hidden="true" className="size-4 text-nbc-royal" strokeWidth={1.5} />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="border-y border-border bg-secondary/25">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <SectionHeading
              eyebrow="Property Gallery"
              title="Look around before you arrive"
              description="Browse the spaces guests use most, from the lobby to the pool terrace."
            />
            <PropertyGallery className="mt-10" images={property.gallery} />
          </div>
        </section>

        {/* Room categories — immediately after the gallery */}
        <section id="room-types" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Room Types"
            title="Available room categories"
            description="A preview of what is available. Choose your exact room and rate in the next step."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {property.rooms.map((room) => (
              <RoomPreviewCard
                key={room.id}
                room={room}
                currency={hotel.currency}
                onViewRooms={scrollToRooms}
              />
            ))}
          </div>
        </section>

        {/* Guest reviews preview */}
        <section>
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <SectionHeading
              eyebrow="Guest Reviews"
              title="What guests say"
              action={<Button variant="outline">View All Reviews</Button>}
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <div className="grid h-fit content-start gap-3 rounded-2xl border border-border/70 bg-card p-7 shadow-card">
                <p className="text-5xl font-semibold tracking-tight text-foreground">
                  {hotel.rating.toFixed(1)}
                </p>
                <p className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={
                        index < Math.round(hotel.rating)
                          ? "size-4 fill-nbc-gold text-nbc-gold"
                          : "size-4 text-muted-foreground/40"
                      }
                    />
                  ))}
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on {hotel.reviewCount} verified guest reviews
                </p>
              </div>

              <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {property.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="grid content-start gap-4 rounded-xl border border-border/70 bg-card p-6 shadow-card"
                  >
                    <Quote
                      aria-hidden="true"
                      className="size-5 text-nbc-scarlet"
                      strokeWidth={1.5}
                    />
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Star aria-hidden="true" className="size-3.5 fill-nbc-gold text-nbc-gold" />
                      {review.rating.toFixed(1)}
                    </p>
                    <h3 className="text-base font-semibold leading-snug text-foreground">
                      {review.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.guest} · {review.origin} · Stayed {review.stayedOn}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Policies — card-based, compact and easy to scan */}
        <section className="border-y border-border bg-secondary/25">
          <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
            <SectionHeading
              eyebrow="Property Policies"
              title="Good to know before you arrive"
              description="The essentials that shape your stay."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {property.policies.map((policy) => {
                const Icon = policy.icon;
                return (
                  <article
                    key={policy.id}
                    className="grid content-start gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card"
                  >
                    <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-nbc-royal">
                      <Icon aria-hidden="true" className="size-4.5" strokeWidth={1.5} />
                    </span>
                    <h3 className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">{policy.label}</h3>
                    <p className="text-sm font-medium leading-relaxed text-foreground">{policy.value}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-20">
            <SectionHeading
              align="center"
              eyebrow="Questions"
              title="Frequently asked questions"
            />
            <Accordion type="single" collapsible className="mt-10">
              {property.faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Continue to room selection */}
        <section className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.07} />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:py-20">
            <div className="min-w-0">
              <p className="nbc-eyebrow text-nbc-gold">Ready when you are</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
                Continue to Room Selection
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/75">
                Compare available rooms, rates and inclusions for your dates at {hotel.name}.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Button variant="scarlet" size="xl" onClick={scrollToRooms}>
                View Available Rooms
              </Button>
              <Button variant="outlineOnDark" size="xl" asChild>
                <Link to="/hotels">Back to Places to Stay</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
