import { Baby, CalendarDays, DoorOpen, Moon, Pencil, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatStayDate, type RoomSelectionSearch } from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface BookingSummaryBarProps {
  hotelName: string;
  search: RoomSelectionSearch;
  nights: number;
  onEdit: () => void;
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
    <div className="flex min-w-0 items-center gap-3">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-nbc-gold" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="nbc-eyebrow text-[0.5625rem] text-primary-foreground/60">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-primary-foreground">{value}</p>
      </div>
    </div>
  );
}

/** Reads back the active stay criteria at the top of the Room Selection page. */
export function BookingSummaryBar({
  hotelName,
  search,
  nights,
  onEdit,
  className,
}: BookingSummaryBarProps) {
  return (
    <div
      className={cn(
        "grid gap-6 rounded-xl border border-primary-foreground/10 bg-nbc-royal/95 p-6 shadow-card lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
        className,
      )}
    >
      <div className="grid min-w-0 gap-5">
        <div className="min-w-0">
          <p className="nbc-eyebrow text-[0.5625rem] text-primary-foreground/60">Your Stay</p>
          <p className="mt-1 truncate text-lg font-semibold text-primary-foreground">{hotelName}</p>
        </div>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Item icon={CalendarDays} label="Check-in" value={formatStayDate(search.checkIn)} />
          <Item icon={CalendarDays} label="Check-out" value={formatStayDate(search.checkOut)} />
          <Item
            icon={Moon}
            label="Nights"
            value={nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Add dates"}
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
      </div>

      <Button variant="onDark" size="lg" onClick={onEdit} className="gap-2 lg:shrink-0">
        <Pencil aria-hidden="true" />
        Edit Search
      </Button>
    </div>
  );
}
