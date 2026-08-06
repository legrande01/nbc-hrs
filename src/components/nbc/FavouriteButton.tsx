import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { isFavourite, toggleFavourite } from "@/lib/nbc-favourites";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  hotelId: string;
  hotelName: string;
  /** onDark sits over imagery, plain sits on a card surface. */
  tone?: "onImage" | "onSurface";
  className?: string;
}

/**
 * Guest-side favourite toggle. Backed by the shared favourite store so every
 * surface (cards, details, Favourite module) stays in sync.
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
    const sync = () => setFavourite(isFavourite(hotelId));
    sync();
    window.addEventListener("nbc-favourites-change", sync);
    return () => window.removeEventListener("nbc-favourites-change", sync);
  }, [hotelId]);

  const toggle = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setFavourite(toggleFavourite(hotelId));
    },
    [hotelId],
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
