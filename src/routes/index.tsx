import { createFileRoute } from "@tanstack/react-router";
import { Apple, ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { Hero } from "@/components/nbc/Hero";
import { SectionHeading } from "@/components/nbc/SectionHeading";
import { DestinationCard } from "@/components/nbc/DestinationCard";
import { HotelCard } from "@/components/nbc/HotelCard";
import { ValueCard } from "@/components/nbc/ValueCard";
import { NewsletterForm } from "@/components/nbc/NewsletterForm";
import {
  featuredDestinations,
  featuredHotels,
  valuePropositions,
} from "@/lib/nbc-content";

import partnerImage from "@/assets/partner.jpg";
import appImage from "@/assets/app-promo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NBC Hospitality — Verified Hotels Across Tanzania" },
      {
        name: "description",
        content:
          "Discover and book verified hotels in Dar es Salaam, Zanzibar, Arusha, Dodoma and Mwanza. Secure NBC payments and a curated standard of hospitality.",
      },
      { property: "og:title", content: "NBC Hospitality — Verified Hotels Across Tanzania" },
      {
        property: "og:description",
        content:
          "A curated network of verified Tanzanian hotels, backed by the trust of the National Bank of Commerce.",
      },
    ],
  }),
  component: HomeExperience,
});

function HomeExperience() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <main className="flex-1">
        <Hero
          headline="Tanzania, beautifully hosted."
          supporting="From the Indian Ocean to the northern highlands, NBC Hospitality brings together verified hotels, secure payments and a standard of service you can rely on."
          primaryCta="Find Your Stay"
          secondaryCta="Explore Destinations"
        />

        {/* Featured destinations */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <SectionHeading
            eyebrow="Featured Destinations"
            title="Where Tanzania welcomes you"
            description="Five regions, one standard of hospitality. Each destination is served by accredited NBC Hospitality partners."
            action={
              <Button variant="outline" size="lg" className="gap-2">
                View all destinations
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                className={index === 0 ? "lg:col-span-2 lg:min-h-96" : undefined}
              />
            ))}
          </div>
        </section>

        {/* Featured hotels */}
        <section className="bg-muted">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <SectionHeading
              eyebrow="Featured Hotels"
              title="Stays worth planning a journey around"
              description="A selection of accredited properties, chosen for their location, service and consistency."
              action={
                <Button variant="outline" size="lg" className="gap-2">
                  Browse all hotels
                  <ArrowRight aria-hidden="true" />
                </Button>
              }
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </section>

        {/* Why choose NBC Hospitality */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <SectionHeading
            align="center"
            eyebrow="Why NBC Hospitality"
            title="Trust, built into every stay"
            description="The same institution Tanzania has banked with for over a century now stands behind how the country hosts."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valuePropositions.map((value) => (
              <ValueCard key={value.id} value={value} />
            ))}
          </div>
        </section>

        {/* Become a hotel partner */}
        <section className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.08} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div className="min-w-0">
              <SectionHeading
                tone="onDark"
                eyebrow="For Hotels"
                title="Grow with Tanzania's hospitality network"
                description="Join a verified network with direct distribution, secure settlement and operational tools built for hotels of every size."
              />
              <ul className="mt-8 space-y-3 text-sm text-primary-foreground/80">
                <li>Direct bookings with no intermediaries</li>
                <li>Settlement through NBC's secure payment rails</li>
                <li>Operational dashboards for rooms, rates and reporting</li>
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button variant="onDark" size="xl">
                  Become a Partner
                </Button>
                <Button variant="outlineOnDark" size="xl">
                  Partner Login
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl shadow-elevated">
              <img
                src={partnerImage}
                alt="Hotel team welcoming guests at an NBC Hospitality partner property"
                width={1200}
                height={900}
                loading="lazy"
                className="aspect-4/3 size-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mobile app promotion */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative order-last overflow-hidden rounded-xl bg-muted shadow-card lg:order-first">
              <img
                src={appImage}
                alt="A traveller managing an NBC Hospitality booking on a mobile phone"
                width={1200}
                height={1200}
                loading="lazy"
                className="aspect-square size-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <SectionHeading
                eyebrow="NBC Hospitality App"
                title="Your stay, in your pocket"
                description="Search, book, check in and pay from one place. Keep every reservation, receipt and confirmation together."
              />
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button variant="default" size="xl" className="gap-2">
                  <Apple aria-hidden="true" />
                  App Store
                </Button>
                <Button variant="outline" size="xl" className="gap-2">
                  <Play aria-hidden="true" />
                  Google Play
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-muted">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Newsletter"
              title="Travel notes from across Tanzania"
              description="New openings, seasonal offers and quiet corners worth knowing about — a few times a year, never more."
            />
            <NewsletterForm className="mx-auto mt-10 max-w-xl text-left" />
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
