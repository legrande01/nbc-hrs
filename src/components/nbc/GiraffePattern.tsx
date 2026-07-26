import { cn } from "@/lib/utils";

interface GiraffePatternProps {
  className?: string;
  /** Subtlety of the decorative NBC giraffe pattern. */
  opacity?: number;
}

/**
 * Official NBC giraffe pattern used as a subtle decorative layer.
 * Purely decorative — hidden from assistive technology.
 */
export function GiraffePattern({ className, opacity = 0.12 }: GiraffePatternProps) {
  return (
    <div
      aria-hidden="true"
      style={{ opacity }}
      className={cn("nbc-pattern pointer-events-none absolute inset-0", className)}
    />
  );
}
