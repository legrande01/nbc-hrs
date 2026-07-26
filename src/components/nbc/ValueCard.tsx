import type { ValueProposition } from "@/lib/nbc-content";
import { cn } from "@/lib/utils";

interface ValueCardProps {
  value: ValueProposition;
  className?: string;
}

/**
 * Reusable value proposition tile.
 */
export function ValueCard({ value, className }: ValueCardProps) {
  const Icon = value.icon;

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-xl border border-border/70 bg-card p-8 transition-shadow hover:shadow-card",
        className,
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-nbc-royal/15 bg-secondary/60 text-nbc-royal">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
    </article>
  );
}
