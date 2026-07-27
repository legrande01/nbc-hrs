import { Baby, CalendarDays, DoorOpen, Moon, Users } from "lucide-react";

import { formatStayDate, type RoomSelectionSearch } from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface BookingSummaryBarProps {
  hotelName: string;
  search: RoomSelectionSearch;
  nights: number;
  className?: string;
}

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-nbc-gold" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="nbc-eyebrow text-[0.5rem] text-primary-foreground/60">{label}</p>
        <p className="truncate text-sm font-medium text-primary-foreground">{value}</p>
      </div>
    </div>
  );
}

/**
 * Compact booking summary header.
 * Read-only: stay criteria are inherited from the completed availability search.
 */
export function BookingSummaryBar({
  hotelName,
  search,
  nights,
  className,
}: BookingSummaryBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-8 gap-y-4 rounded-xl border border-primary-foreground/10 bg-nbc-royal/95 px-6 py-4 shadow-card",
        className,
      )}
    >
      <div className="min-w-0 shrink-0">
        <p className="nbc-eyebrow text-[0.5rem] text-primary-foreground/60">Booking</p>
        <p className="truncate text-base font-semibold text-primary-foreground">{hotelName}</p>
      </div>

      <div className="hidden h-8 w-px shrink-0 bg-primary-foreground/15 lg:block" />

      <Item icon={CalendarDays} label="Check-in" value={formatStayDate(search.checkIn)} />
      <Item icon={CalendarDays} label="Check-out" value={formatStayDate(search.checkOut)} />
      <Item
        icon={Moon}
        label="Nights"
        value={nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "—"}
      />
      <Item
        icon={Users}
        label="Adults"
        value={`${search.adults} ${search.adults === 1 ? "adult" : "adults"}`}
      />
      <Item
        icon={Baby}
        label="Children"
        value={`${search.children} ${search.children === 1 ? "child" : "children"}`}
      />
      <Item
        icon={DoorOpen}
        label="Rooms"
        value={`${search.rooms} ${search.rooms === 1 ? "room" : "rooms"}`}
      />
    </div>
  );
}
