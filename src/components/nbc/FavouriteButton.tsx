import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "nbc-favourite-hotels";

function readFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

interface FavouriteButtonProps {
  hotelId: string;
  hotelName: string;
  /** onDark sits over imagery, plain sits on a card surface. */
  tone?: "onImage" | "onSurface";
  className?: string;
}

/**
 * Guest-side favourite toggle. Stored locally so it works without an account.
 */
export function FavouriteButton({
  hotelId,
  hotelName,
  tone = "onImage",
  className,
}: FavouriteButtonProps) {
  const [favourite, setFavourite] = useState(false);

  // Read after hydration so server and client markup match.
  useEffect(() => {
    setFavourite(readFavourites().includes(hotelId));
  }, [hotelId]);

  const toggle = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const next = !favourite;
      setFavourite(next);
      const current = readFavourites().filter((id) => id !== hotelId);
      if (next) current.push(hotelId);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      } catch {
        /* storage unavailable — the in-session state still applies */
      }
    },
    [favourite, hotelId],
  );

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favourite}
      aria-label={
        favourite ? `Remove ${hotelName} from favourites` : `Save ${hotelName} to favourites`
      }
      className={cn(
        "flex size-9 items-center justify-center rounded-full transition-colors",
        tone === "onImage"
          ? "bg-background/85 text-foreground shadow-card hover:bg-background"
          : "border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-4", favourite && "fill-nbc-scarlet text-nbc-scarlet")}
        strokeWidth={1.75}
      />
    </button>
  );
}
