import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "onDark";
  action?: ReactNode;
  className?: string;
}

/**
 * Shared section header used by every content block on the platform.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  action,
  className,
}: SectionHeadingProps) {
  const onDark = tone === "onDark";

  return (
    <div
      className={cn(
        "grid gap-6",
        action ? "md:grid-cols-[minmax(0,1fr)_auto] md:items-end" : "",
        className,
      )}
    >
      <div className={cn("min-w-0 max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <p className={cn("nbc-eyebrow", onDark ? "text-nbc-gold" : "text-nbc-scarlet")}>
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
            onDark ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 text-base leading-relaxed",
              onDark ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
