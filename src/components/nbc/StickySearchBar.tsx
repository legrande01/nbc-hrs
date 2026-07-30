import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, Search, Users, X } from "lucide-react";

import { HotelSearch, type HotelSearchValue } from "@/components/nbc/HotelSearch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickySearchBarProps {
  /** Element that, once scrolled past, reveals the sticky bar. */
  watchRef: React.RefObject<HTMLElement | null>;
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  /** Receives only stay fields — active filters are preserved by the caller. */
  onSearch: (value: HotelSearchValue) => void;
}

function toDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatShort(value: string): string {
  const date = toDate(value);
  if (!date) return "Add dates";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/**
 * Compact stay context that follows the guest down the results page.
 * Collapsed by default; expands into the full search once a field is selected.
 */
export function StickySearchBar({
  watchRef,
  destination,
  checkIn,
  checkOut,
  guests,
  rooms,
  onSearch,
}: StickySearchBarProps) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = watchRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
        if (entry.isIntersecting) setExpanded(false);
      },
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchRef]);

  const dates =
    checkIn && checkOut ? `${formatShort(checkIn)} – ${formatShort(checkOut)}` : "Add dates";

  const fields = [
    { key: "destination", icon: MapPin, label: "Destination", value: destination || "Anywhere" },
    { key: "dates", icon: CalendarDays, label: "Dates", value: dates },
    {
      key: "guests",
      icon: Users,
      label: "Guests",
      value: `${guests} guest${guests === 1 ? "" : "s"} · ${rooms} room${rooms === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-card/95 shadow-card backdrop-blur-md transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto max-w-7xl px-5 py-3 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-3 divide-x divide-border rounded-full border border-border bg-background">
            {fields.map(({ key, icon: Icon, label, value }) => (
              <button
                key={key}
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={expanded}
                className="flex min-w-0 items-center gap-2 px-4 py-2 text-left transition-colors first:rounded-l-full last:rounded-r-full hover:bg-secondary/50"
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-nbc-royal"
                  strokeWidth={1.75}
                />
                <span className="min-w-0">
                  <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  <span className="block truncate text-sm font-medium text-foreground">
                    {value}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Button
            variant={expanded ? "outline" : "default"}
            size="icon"
            className="shrink-0 rounded-full"
            aria-label={expanded ? "Close search" : "Edit search"}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? (
              <X aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <Search aria-hidden="true" strokeWidth={1.75} />
            )}
          </Button>
        </div>

        {expanded && (
          <div ref={panelRef} className="pb-2 pt-4">
            <HotelSearch
              showTrustIndicators={false}
              submitLabel="Update Search"
              defaultValue={{
                destination,
                checkIn: toDate(checkIn),
                checkOut: toDate(checkOut),
                guests: String(guests),
                rooms: String(rooms),
              }}
              onSearch={(value) => {
                setExpanded(false);
                onSearch(value);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
