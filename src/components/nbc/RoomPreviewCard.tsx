import { BedDouble, Maximize2, Users } from "lucide-react";

import { AvailabilityBadge } from "@/components/nbc/AvailabilityBadge";
import { ImageCarousel } from "@/components/nbc/ImageCarousel";
import { OverflowChips, type Chip } from "@/components/nbc/OverflowChips";
import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { availabilityFromRoomsLeft } from "@/lib/nbc-media";
import type { RoomCategory } from "@/lib/nbc-room-selection";
import { cn } from "@/lib/utils";

interface RoomPreviewCardProps {
  room: RoomCategory;
  currency: string;
  onBookNow: () => void;
  className?: string;
}

/** Read-only room introduction. Exact rooms and rates are chosen in the next step. */
export function RoomPreviewCard({ room, currency, onBookNow, className }: RoomPreviewCardProps) {
  const availability = availabilityFromRoomsLeft(room.roomsLeft);
  const soldOut = availability === "sold-out";

  const amenityChips: Chip[] = room.amenities.map((key) => ({
    key,
    label: amenityMeta[key].label,
    icon: amenityMeta[key].icon,
  }));

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-shadow duration-500 ease-out hover:shadow-elevated",
        className,
      )}
    >
      <ImageCarousel images={room.images} />

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="grid gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{room.name}</h3>
          <AvailabilityBadge status={availability} roomsLeft={room.roomsLeft} />
        </div>

        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Users aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            Up to {room.maxAdults} adults
            {room.maxChildren > 0 ? ` and ${room.maxChildren} children` : ""}
          </li>
          <li className="flex items-center gap-2">
            <BedDouble aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            {room.bedType}
          </li>
          <li className="flex items-center gap-2">
            <Maximize2 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            {room.sizeSqm} m² · {room.view}
          </li>
        </ul>

        <OverflowChips chips={amenityChips} limit={3} ariaLabel={`${room.name} amenities`} />

        <div className="mt-auto grid gap-4 border-t border-border pt-5">
          <div>
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {formatPrice(room.nightlyRate, currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">per night</p>
          </div>
          <Button onClick={onBookNow} disabled={soldOut}>
            Book Now
          </Button>
        </div>
      </div>
    </article>
  );
}
