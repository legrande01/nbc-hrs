import { CalendarDays, MapPin, Pencil, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DiscoverySearch } from "@/lib/nbc-discovery-filters";
import { cn } from "@/lib/utils";

interface SearchSummaryProps {
  search: DiscoverySearch;
  onEdit: () => void;
  editing: boolean;
  className?: string;
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-nbc-gold" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="nbc-eyebrow text-[0.5625rem] text-primary-foreground/60">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-primary-foreground">{value}</p>
      </div>
    </div>
  );
}

/**
 * Reads back the customer's current search criteria and offers Edit Search.
 * Criteria only change when the customer submits the search form.
 */
export function SearchSummary({ search, onEdit, editing, className }: SearchSummaryProps) {
  const checkIn = formatDate(search.checkIn);
  const checkOut = formatDate(search.checkOut);
  const dates = checkIn && checkOut ? `${checkIn} — ${checkOut}` : "Dates not selected";

  return (
    <div
      className={cn(
        "grid gap-6 rounded-xl border border-primary-foreground/10 bg-nbc-royal/95 p-6 shadow-card lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
        className,
      )}
    >
      <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Item icon={MapPin} label="Destination" value={search.destination || "All destinations"} />
        <Item icon={CalendarDays} label="Stay" value={dates} />
        <Item
          icon={Users}
          label="Guests"
          value={`${search.guests} ${search.guests === 1 ? "guest" : "guests"}`}
        />
        <Item
          icon={Users}
          label="Rooms"
          value={`${search.rooms} ${search.rooms === 1 ? "room" : "rooms"}`}
        />
      </div>

      <Button variant="onDark" size="lg" onClick={onEdit} className="gap-2 lg:shrink-0">
        <Pencil aria-hidden="true" />
        {editing ? "Close" : "Edit Search"}
      </Button>
    </div>
  );
}
