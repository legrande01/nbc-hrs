import { BedDouble, Croissant, Maximize2, ShieldCheck, Users } from "lucide-react";

import { AvailabilityBadge } from "@/components/nbc/AvailabilityBadge";
import { ImageCarousel } from "@/components/nbc/ImageCarousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { amenityMeta } from "@/lib/nbc-amenities";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { availabilityFromRoomsLeft } from "@/lib/nbc-media";
import type { RoomCategory } from "@/lib/nbc-room-selection";

interface RoomDetailsModalProps {
  room: RoomCategory | null;
  currency: string;
  hasDates: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: () => void;
  bookDisabled?: boolean;
}

/** Full room specification with zoomable imagery, variants and policies. */
export function RoomDetailsModal({
  room,
  currency,
  hasDates,
  open,
  onOpenChange,
  onBook,
  bookDisabled,
}: RoomDetailsModalProps) {
  if (!room) return null;
  const availability = availabilityFromRoomsLeft(room.roomsLeft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{room.name}</DialogTitle>
          <DialogDescription>{room.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <ImageCarousel
            images={room.images}
            zoomable
            aspectClassName="aspect-16/9"
            className="overflow-hidden rounded-xl"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {formatPrice(room.nightlyRate, currency)}
              </span>
              <span className="text-sm text-muted-foreground">per night, excluding taxes</span>
            </p>
            {hasDates && <AvailabilityBadge status={availability} roomsLeft={room.roomsLeft} />}
          </div>

          <section className="grid gap-3">
            <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Specifications</p>
            <ul className="grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <Maximize2 aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                {room.sizeSqm} sqm
              </li>
              <li className="flex items-center gap-2">
                <BedDouble aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                {room.bedType}
              </li>
              <li className="flex items-center gap-2">
                <Users aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                Max {room.maxAdults} adults
                {room.maxChildren > 0 ? ` · ${room.maxChildren} children` : ""}
              </li>
              <li className="flex items-center gap-2">
                <Croissant aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.75} />
                {room.breakfast}
              </li>
              <li>View: {room.view}</li>
              <li>Balcony: {room.balcony ? "Yes" : "No"}</li>
              <li>{room.smoking}</li>
            </ul>
          </section>

          <section className="grid gap-3">
            <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Amenities</p>
            <ul className="flex flex-wrap gap-2">
              {room.amenities.map((key) => {
                const { label, icon: Icon } = amenityMeta[key];
                return (
                  <li
                    key={key}
                    className="flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />
                    {label}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="grid gap-3">
            <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Room Variations</p>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {room.variants.map((variant) => (
                <li
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/25 px-4 py-3"
                >
                  <span className="font-medium text-foreground">{variant.label}</span>
                  <span>
                    {variant.sizeSqm} sqm · {variant.bedType}
                  </span>
                  {hasDates && (
                    <AvailabilityBadge
                      status={availabilityFromRoomsLeft(variant.roomsLeft)}
                      roomsLeft={variant.roomsLeft}
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="grid gap-3">
            <p className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">Policies</p>
            <p className="flex items-start gap-2 text-sm text-nbc-emerald">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
                strokeWidth={1.75}
              />
              {room.cancellation}
            </p>
            <ul className="grid gap-1.5 text-sm text-muted-foreground">
              {room.otherInfo.map((info) => (
                <li key={info}>· {info}</li>
              ))}
            </ul>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="scarlet" onClick={onBook} disabled={bookDisabled}>
            Book Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
