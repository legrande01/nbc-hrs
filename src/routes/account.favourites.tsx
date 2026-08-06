import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Heart, MapPin, Search, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { HotelCarousel } from "@/components/nbc/HotelCarousel";
import { HotelResultCard } from "@/components/nbc/HotelResultCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { amenityMeta, filterableAmenities } from "@/lib/nbc-amenities";
import {
  discoveryCities,
  priceBounds,
  propertyTypeLabels,
  propertyTypeOptions,
} from "@/lib/nbc-discovery";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import {
  exploreCollections,
  favouriteSummaryDemo,
  formatSavedDate,
  hotelsByIds,
  recentlyViewedIds,
  recommendedIds,
  removeFavourite,
  resolveFavouriteHotels,
  useFavourites,
} from "@/lib/nbc-favourites";
import { hotelDistanceKm } from "@/lib/nbc-media";

export const Route = createFileRoute("/account/favourites")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/favourites" } });
  },
  head: () => ({
    meta: [
      { title: "Favourite · NBC Hospitality" },
      {
        name: "description",
        content:
          "Keep track of hotels you'd love to stay at across Tanzania and revisit them when planning your next trip.",
      },
      { property: "og:title", content: "Favourite · NBC Hospitality" },
      {
        property: "og:description",
        content: "Saved hotels, recently viewed stays and fresh recommendations from NBC.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavouritesPage,
});

type SortKey = "recent" | "rating" | "price" | "distance";

const sortLabels: Record<SortKey, string> = {
  recent: "Recently Saved",
  rating: "Highest Rated",
  price: "Lowest Price",
  distance: "Closest Destination",
};

function FavouritesPage() {
  const entries = useFavourites("hotel");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("all");
  const [rating, setRating] = useState("all");
  const [category, setCategory] = useState("all");
  const [amenity, setAmenity] = useState("all");
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [sort, setSort] = useState<SortKey>("recent");

  const saved = useMemo(() => resolveFavouriteHotels(entries), [entries]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = saved.filter(({ hotel }) => {
      if (needle) {
        const haystack = `${hotel.name} ${hotel.city} ${hotel.area}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (destination !== "all" && hotel.city !== destination) return false;
      if (rating !== "all" && hotel.stars !== Number(rating)) return false;
      if (category !== "all" && hotel.propertyType !== category) return false;
      if (amenity !== "all" && !hotel.amenities.includes(amenity as never)) return false;
      if (hotel.priceFrom > maxPrice) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "rating":
        sorted.sort((a, b) => b.hotel.rating - a.hotel.rating);
        break;
      case "price":
        sorted.sort((a, b) => a.hotel.priceFrom - b.hotel.priceFrom);
        break;
      case "distance":
        sorted.sort((a, b) => hotelDistanceKm(a.hotel) - hotelDistanceKm(b.hotel));
        break;
      default:
        sorted.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    }
    return sorted;
  }, [saved, query, destination, rating, category, amenity, maxPrice, sort]);

  const summary = [
    { label: "Saved Hotels", value: saved.length, hint: "Ready when you are" },
    {
      label: "Recently Viewed",
      value: favouriteSummaryDemo.recentlyViewed,
      hint: "In the last 30 days",
    },
    {
      label: "Upcoming Trips",
      value: favouriteSummaryDemo.upcomingTrips,
      hint: "Stays already booked",
    },
  ];

  const onRemove = (id: string, name: string) => {
    removeFavourite(id);
    toast.success(`${name} removed from your favourites`);
  };

  const onShare = async (id: string, name: string) => {
    const url = `${window.location.origin}/hotels/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: `Take a look at ${name} on NBC Hospitality`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Sharing is unavailable on this device");
    }
  };

  return (
    <AccountLayout>
      <div className="grid gap-8">
        <header className="grid gap-2">
          <p className="nbc-eyebrow text-nbc-scarlet">Customer Account</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Favourite</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Keep track of hotels you'd love to stay at and revisit them whenever you're planning
            your next trip.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {summary.map((card) => (
            <AccountCard key={card.label} className="p-5">
              <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-nbc-royal">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </AccountCard>
          ))}
        </div>

        <AccountCard className="grid gap-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="grid gap-2">
              <Label htmlFor="favourite-search">Search saved hotels</Label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.75}
                />
                <Input
                  id="favourite-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Hotel name or destination"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="favourite-sort">Sort by</Label>
              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger id="favourite-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {sortLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="favourite-destination">Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger id="favourite-destination">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All destinations</SelectItem>
                  {discoveryCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favourite-rating">Hotel rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger id="favourite-rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any rating</SelectItem>
                  {[5, 4, 3].map((star) => (
                    <SelectItem key={star} value={String(star)}>
                      {star} Star
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favourite-category">Hotel category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="favourite-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {propertyTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {propertyTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="favourite-amenity">Amenities</Label>
              <Select value={amenity} onValueChange={setAmenity}>
                <SelectTrigger id="favourite-amenity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any amenity</SelectItem>
                  {filterableAmenities.map((key) => (
                    <SelectItem key={key} value={key}>
                      {amenityMeta[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="favourite-price">Price range (per night)</Label>
            <Slider
              id="favourite-price"
              value={[maxPrice]}
              min={priceBounds.min}
              max={priceBounds.max}
              step={priceBounds.step}
              onValueChange={([value]) => setMaxPrice(value)}
              aria-label="Maximum price per night"
            />
            <p className="text-sm text-muted-foreground">
              {formatPrice(priceBounds.min)} – {formatPrice(maxPrice)}
            </p>
          </div>
        </AccountCard>

        <section className="grid gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Favourite hotels
            </h2>
            <p className="text-sm text-muted-foreground">
              {visible.length} of {saved.length} saved
            </p>
          </div>

          {saved.length === 0 ? (
            <AccountEmptyState
              title="Nothing saved yet."
              description="Start exploring verified hotels across Tanzania and save places you'd love to visit."
              action={
                <Button asChild>
                  <Link to="/hotels" search={{}}>
                    Explore Hotels
                  </Link>
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <AccountEmptyState
              title="No favourites match these filters"
              description="Try widening your destination, price or amenity selection to see more saved hotels."
            />
          ) : (
            <div className="grid gap-5">
              {visible.map(({ hotel, savedAt }) => (
                <HotelResultCard
                  key={hotel.id}
                  hotel={hotel}
                  meta={
                    <span className="inline-flex items-center gap-1.5">
                      <Heart aria-hidden="true" className="size-3.5 text-nbc-scarlet" />
                      Saved on {formatSavedDate(savedAt)}
                    </span>
                  }
                  extraActions={
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => void onShare(hotel.id, hotel.name)}
                        aria-label={`Share ${hotel.name}`}
                      >
                        <Share2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
                        Share
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onRemove(hotel.id, hotel.name)}
                        aria-label={`Remove ${hotel.name} from favourites`}
                        className="text-nbc-scarlet hover:text-nbc-scarlet"
                      >
                        <Trash2 aria-hidden="true" className="size-4" strokeWidth={1.75} />
                        Remove
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>

        <HotelCarousel
          title="Recently viewed"
          description="Pick up where you left off."
          hotels={hotelsByIds(recentlyViewedIds)}
        />

        <HotelCarousel
          title="Recommended For You"
          description="Based on the stays you've viewed and the destinations you save."
          hotels={hotelsByIds(recommendedIds)}
        />

        <section className="grid gap-6">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Continue exploring
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
              Verified stays across Tanzania.
            </p>
          </div>
          {exploreCollections.map((collection) => (
            <HotelCarousel
              key={collection.key}
              title={collection.title}
              description={collection.description}
              hotels={hotelsByIds(collection.hotelIds)}
            />
          ))}
        </section>
      </div>
    </AccountLayout>
  );
}
