import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/nbc-discovery-filters";
import { availabilityFromRoomsLeft } from "@/lib/nbc-media";
import type { RoomCategory } from "@/lib/nbc-room-selection";

interface CompareRoomsDrawerProps {
  rooms: RoomCategory[];
  currency: string;
  hasDates: boolean;
  onRemove: (roomId: string) => void;
  onClear: () => void;
  onBook: (roomId: string) => void;
}

const attributes: { label: string; render: (room: RoomCategory) => string }[] = [
  { label: "Size", render: (room) => `${room.sizeSqm} sqm` },
  { label: "Bed", render: (room) => room.bedType },
  {
    label: "Occupancy",
    render: (room) =>
      `${room.maxAdults} adults${room.maxChildren > 0 ? ` · ${room.maxChildren} children` : ""}`,
  },
  { label: "View", render: (room) => room.view },
  { label: "Balcony", render: (room) => (room.balcony ? "Yes" : "No") },
  { label: "Breakfast", render: (room) => room.breakfast },
  { label: "Cancellation", render: (room) => room.cancellation },
];

/** Persistent bottom sheet comparing up to three room categories side by side. */
export function CompareRoomsDrawer({
  rooms,
  currency,
  hasDates,
  onRemove,
  onClear,
  onBook,
}: CompareRoomsDrawerProps) {
  if (rooms.length === 0) return null;

  return (
    <aside
      aria-label="Room comparison"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 shadow-elevated backdrop-blur-md"
    >
      <div className="nbc-container grid gap-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            Comparing {rooms.length} of 3 rooms
          </p>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear all
          </Button>
        </div>

        <div className="max-h-[42dvh] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-32 pb-3 pr-4 align-bottom">
                  <span className="nbc-eyebrow text-[0.5625rem] text-muted-foreground">
                    Attribute
                  </span>
                </th>
                {rooms.map((room) => (
                  <th key={room.id} scope="col" className="pb-3 pr-4 align-bottom">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(room.nightlyRate, currency)} / night
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${room.name} from comparison`}
                        onClick={() => onRemove(room.id)}
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X aria-hidden="true" className="size-4" strokeWidth={2} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute) => (
                <tr key={attribute.label} className="border-t border-border/60">
                  <th scope="row" className="py-2 pr-4 font-medium text-muted-foreground">
                    {attribute.label}
                  </th>
                  {rooms.map((room) => (
                    <td key={room.id} className="py-2 pr-4 text-foreground">
                      {attribute.render(room)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border/60">
                <th scope="row" className="py-3 pr-4 font-medium text-muted-foreground">
                  Action
                </th>
                {rooms.map((room) => {
                  const soldOut =
                    hasDates && availabilityFromRoomsLeft(room.roomsLeft) === "sold-out";
                  return (
                    <td key={room.id} className="py-3 pr-4">
                      <Button
                        variant="scarlet"
                        size="sm"
                        disabled={soldOut}
                        onClick={() => onBook(room.id)}
                      >
                        Book Now
                      </Button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </aside>
  );
}
