import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Regulatory notice: guest identification is verified by Reception at
 * check-in, not collected online.
 */
export function ComplianceNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-nbc-royal/15 bg-secondary/40 p-5",
        className,
      )}
    >
      <ShieldCheck
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-nbc-royal"
        strokeWidth={1.75}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">Identification at check-in</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          All staying guests must present a valid government-issued ID at check-in, in accordance
          with Tanzanian regulations. Guest and room assignment is completed by Reception on
          arrival, so there is no need to provide it here.
        </p>
      </div>
    </div>
  );
}
