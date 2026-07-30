import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Chip {
  key: string;
  label: string;
  icon?: LucideIcon;
}

interface OverflowChipsProps {
  chips: Chip[];
  /** Number of chips shown before collapsing into "+X more". */
  limit?: number;
  ariaLabel: string;
  className?: string;
  chipClassName?: string;
}

/** Renders a capped chip list with a "+X more" summary chip. */
export function OverflowChips({
  chips,
  limit = 3,
  ariaLabel,
  className,
  chipClassName,
}: OverflowChipsProps) {
  if (chips.length === 0) return null;
  const visible = chips.slice(0, limit);
  const overflow = chips.length - visible.length;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label={ariaLabel}>
      {visible.map(({ key, label, icon: Icon }) => (
        <li
          key={key}
          className={cn(
            "flex min-w-0 items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 text-xs font-medium text-muted-foreground",
            chipClassName,
          )}
        >
          {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={1.75} />}
          <span className="truncate">{label}</span>
        </li>
      ))}
      {overflow > 0 && (
        <li
          className={cn(
            "flex shrink-0 items-center rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-semibold text-nbc-royal",
            chipClassName,
          )}
          title={chips
            .slice(limit)
            .map((chip) => chip.label)
            .join(", ")}
        >
          +{overflow} more
        </li>
      )}
    </ul>
  );
}
