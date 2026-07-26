import { BedDouble, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import type { RoomTypePreview } from "@/lib/nbc-property";
import { cn } from "@/lib/utils";

interface RoomPreviewCardProps {
  room: RoomTypePreview;
  currency: string;
  onViewRooms: () => void;
  className?: string;
}

/** Read-only room introduction. Selection happens in the Room Selection module. */
export function RoomPreviewCard({ room, currency, onViewRooms, className }: RoomPreviewCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-elevated",
        className,
      )}
    >
      <div className="overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-4/3 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{room.name}</h3>

        <ul className="grid gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Users aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            {room.occupancy}
          </li>
          <li className="flex items-center gap-2">
            <BedDouble aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
            {room.bedType}
          </li>
        </ul>

        <ul className="flex flex-wrap gap-2" aria-label={`${room.name} amenities`}>
          {room.amenities.map((key) => {
            const { label, icon: Icon } = amenityMeta[key];
            return (
              <li
                key={key}
                className="flex min-w-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto grid gap-4 border-t border-border pt-5">
          <div>
            <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">From</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {formatPrice(room.priceFrom, currency)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">per night</p>
          </div>
          <Button onClick={onViewRooms}>View Available Rooms</Button>
        </div>
      </div>
    </article>
  );
}
