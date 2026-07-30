import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { GiraffePattern } from "@/components/nbc/GiraffePattern";
import { HotelSearch, type HotelSearchValue } from "@/components/nbc/HotelSearch";
import { SearchSummary } from "@/components/nbc/SearchSummary";
import { StickySearchBar } from "@/components/nbc/StickySearchBar";

import {
  ActiveFilterChips,
  buildActiveFilterChips,
  type ActiveFilterChip,
} from "@/components/nbc/ActiveFilterChips";
import { HotelFilters } from "@/components/nbc/HotelFilters";
import { HotelResultCard } from "@/components/nbc/HotelResultCard";
import { HotelResultsSkeletonList } from "@/components/nbc/HotelResultSkeleton";
import { EmptyResults } from "@/components/nbc/EmptyResults";
import { discoveryCities, sortOptions, type SortKey } from "@/lib/nbc-discovery";
import {
  emptyFilters,
  hasActiveFilters,
  parseDiscoverySearch,
  selectHotels,
  type DiscoverySearch,
} from "@/lib/nbc-discovery-filters";

const PAGE_SIZE = 5;

export const Route = createFileRoute("/hotels/")({
  validateSearch: (search: Record<string, unknown>) => parseDiscoverySearch(search),
  component: HotelDiscoveryPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">No places to stay found.</div>
  ),
  head: () => ({
    meta: [
      { title: "Places to Stay in Tanzania — NBC Hospitality" },
      {
        name: "description",
        content:
          "Compare verified hotels, resorts, lodges and apartments across Tanzania. Filter by price, star rating, amenities and location.",
      },
      { property: "og:title", content: "Places to Stay in Tanzania — NBC Hospitality" },
      {
        property: "og:description",
        content:
          "Compare verified places to stay across Dar es Salaam, Zanzibar, Arusha, Dodoma and Mwanza.",
      },
    ],
  }),
});

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function HotelDiscoveryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/hotels" });

  const [editing, setEditing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLElement>(null);


  const update = useCallback(
    (patch: Partial<DiscoverySearch>, resetPage = true) => {
      navigate({
        search: (prev: DiscoverySearch) => ({ ...prev, ...patch, ...(resetPage ? { page: 1 } : {}) }),
        replace: true,
      });
    },
    [navigate],
  );

  const results = useMemo(() => selectHotels(search), [search]);
  const chips = useMemo(() => buildActiveFilterChips(search), [search]);
  const visible = results.slice(0, search.page * PAGE_SIZE);
  const hasMore = visible.length < results.length;

  // Simulated fetch latency so skeletons appear whenever criteria change.
  const resultsKey = JSON.stringify({ ...search, page: undefined });
  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, [resultsKey]);

  const onSearchSubmit = (value: HotelSearchValue) => {
    setEditing(false);
    update({
      destination: value.destination,
      checkIn: value.checkIn ? value.checkIn.toISOString().slice(0, 10) : "",
      checkOut: value.checkOut ? value.checkOut.toISOString().slice(0, 10) : "",
      guests: Number(value.guests),
      rooms: Number(value.rooms),
    });
  };

  const clearFilters = () => update({ ...emptyFilters });

  const removeChip = (chip: ActiveFilterChip) => update(chip.remove);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />

      <StickySearchBar
        watchRef={heroRef}
        destination={search.destination}
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        guests={search.guests}
        rooms={search.rooms}
        onSearch={onSearchSubmit}
      />

      <main className="flex-1">
        {/* Search summary */}
        <section ref={heroRef} className="relative isolate overflow-hidden nbc-royal-gradient">
          <GiraffePattern opacity={0.07} />

          <div className="relative mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
            <p className="nbc-eyebrow text-nbc-gold">Hotel Discovery</p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl">
              Find the stay that fits the journey
            </h1>

            <SearchSummary
              className="mt-8"
              search={search}
              editing={editing}
              onEdit={() => setEditing((open) => !open)}
            />

            {editing && (
              <HotelSearch
                className="mt-6"
                showTrustIndicators={false}
                submitLabel="Search"
                defaultValue={{
                  destination: search.destination,
                  checkIn: toDate(search.checkIn),
                  checkOut: toDate(search.checkOut),
                  guests: String(search.guests),
                  rooms: String(search.rooms),
                }}
                onSearch={onSearchSubmit}
              />
            )}
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
            {/* Desktop filters */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 grid gap-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <h2 className="min-w-0 truncate text-lg font-semibold text-foreground">Filters</h2>
                  {hasActiveFilters(search) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 shrink-0 text-xs text-nbc-scarlet hover:text-nbc-scarlet"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <HotelFilters value={search} onChange={(patch) => update(patch)} />
              </div>
            </aside>

            <div className="min-w-0">
              <ActiveFilterChips
                className="mb-6"
                chips={chips}
                onRemove={removeChip}
                onClearAll={clearFilters}
              />

              {/* Result summary, mobile filters and sorting */}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-6 sm:flex sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {loading ? "Finding places to stay…" : `${results.length} Places to Stay`}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {search.destination ? `In and around ${search.destination}` : "Across Tanzania"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="gap-2 lg:hidden">
                        <SlidersHorizontal aria-hidden="true" />
                        Filters
                        {chips.length > 0 && (
                          <span className="rounded-full bg-nbc-royal px-2 py-0.5 text-xs text-primary-foreground">
                            {chips.length}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-8">
                        <HotelFilters value={search} onChange={(patch) => update(patch)} />
                        <div className="mt-8 flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={clearFilters}>
                            Clear All
                          </Button>
                          <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                            Show {results.length} Stays
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select
                    value={search.sort}
                    onValueChange={(value) => update({ sort: value as SortKey })}
                  >
                    <SelectTrigger className="w-44" aria-label="Sort results">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hotel results */}
              <div className="mt-8">
                {loading ? (
                  <HotelResultsSkeletonList count={3} />
                ) : results.length === 0 ? (
                  <EmptyResults
                    destinations={discoveryCities}
                    onModifySearch={() => {
                      setEditing(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onClearFilters={clearFilters}
                    onExplore={(destination) => update({ ...emptyFilters, destination })}
                  />
                ) : (
                  <div className="grid gap-6">
                    {visible.map((hotel) => (
                      <HotelResultCard
                        key={hotel.id}
                        hotel={hotel}
                        stay={{
                          checkIn: search.checkIn,
                          checkOut: search.checkOut,
                          adults: search.guests,
                          children: 0,
                          rooms: search.rooms,
                        }}
                      />

                    ))}
                  </div>
                )}
              </div>

              {/* Load more */}
              {!loading && hasMore && (
                <div className="mt-12 grid justify-items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {visible.length} of {results.length} places to stay
                  </p>
                  <Button
                    variant="outline"
                    size="xl"
                    onClick={() => update({ page: search.page + 1 }, false)}
                  >
                    Load More Stays
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
