import { availabilityLabels, type AvailabilityStatus } from "@/lib/nbc-media";
import { cn } from "@/lib/utils";

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  /** Optional inventory count, shown for the few-left state. */
  roomsLeft?: number;
  className?: string;
}

const styles: Record<AvailabilityStatus, string> = {
  available: "bg-nbc-emerald/10 text-nbc-emerald",
  "few-left": "bg-nbc-gold/20 text-foreground",
  "sold-out": "bg-nbc-scarlet/10 text-nbc-scarlet",
};

/**
 * Single source of truth for availability signalling.
 * Availability is always communicated as a badge, never as a CTA label.
 */
export function AvailabilityBadge({ status, roomsLeft, className }: AvailabilityBadgeProps) {
  const label =
    status === "few-left" && typeof roomsLeft === "number" && roomsLeft > 0
      ? `Only ${roomsLeft} room${roomsLeft === 1 ? "" : "s"} left`
      : availabilityLabels[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {label}
    </span>
  );
}
