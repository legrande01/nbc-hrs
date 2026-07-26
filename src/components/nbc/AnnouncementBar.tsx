import { useState } from "react";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  message?: string;
  actionLabel?: string;
  dismissible?: boolean;
}

/**
 * Slim promotional strip above the global navigation.
 * Placeholder content — copy is injected by the caller.
 */
export function AnnouncementBar({
  message = "Introducing NBC Hospitality — a curated network of verified hotels across Tanzania.",
  actionLabel = "Discover more",
  dismissible = true,
}: AnnouncementBarProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="bg-nbc-royal-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-2.5 sm:flex sm:justify-center lg:px-8">
        <p className="min-w-0 text-center text-xs leading-relaxed sm:text-[0.8125rem]">
          <span className="truncate sm:whitespace-normal">{message}</span>{" "}
          <button
            type="button"
            className="cursor-pointer font-semibold underline underline-offset-4 hover:text-nbc-gold"
          >
            {actionLabel}
          </button>
        </p>
        {dismissible && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Dismiss announcement"
            className="shrink-0 cursor-pointer rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 sm:absolute sm:right-6"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
