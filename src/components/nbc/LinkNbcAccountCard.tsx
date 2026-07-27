import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkNbcAccountCardProps {
  onLink: () => void;
  className?: string;
}

/**
 * Discovery card shown when the guest has no NBC account linked.
 * NBC-exclusive methods stay visible — this is an invitation, not an error.
 */
export function LinkNbcAccountCard({ onLink, className }: LinkNbcAccountCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-nbc-gold/40 bg-nbc-gold/10 p-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 gap-4">
        <Sparkles
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-nbc-royal"
          strokeWidth={1.75}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Unlock NBC exclusive ways to pay
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Link your NBC account to finance your stay with Buy Now Pay Later, pay from a Save to
            Buy goal, or redeem loyalty points.
          </p>
        </div>
      </div>
      <Button variant="scarlet" onClick={onLink} className="shrink-0">
        Link NBC Account
      </Button>
    </div>
  );
}
