import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  className?: string;
  tone?: "default" | "onDark";
  onSubscribe?: (email: string) => void;
}

/**
 * Reusable newsletter capture. Submission is delegated to the caller.
 */
export function NewsletterForm({ className, tone = "default", onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const onDark = tone === "onDark";

  return (
    <form
      className={cn("w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (!email) return;
        onSubscribe?.(email);
        setSubmitted(true);
        setEmail("");
      }}
    >
      <Label htmlFor="newsletter-email" className="sr-only">
        Email address
      </Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Mail
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
              onDark ? "text-primary-foreground/60" : "text-muted-foreground",
            )}
          />
          <Input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            className={cn(
              "h-12 pl-9",
              onDark &&
                "border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50",
            )}
          />
        </div>
        <Button type="submit" variant="scarlet" size="xl" className="shrink-0">
          Subscribe
        </Button>
      </div>
      <p
        aria-live="polite"
        className={cn(
          "mt-3 text-xs leading-relaxed",
          onDark ? "text-primary-foreground/60" : "text-muted-foreground",
        )}
      >
        {submitted
          ? "Thank you — you are on the list. Look out for our next dispatch."
          : "Offers, new openings and travel notes from across Tanzania. Unsubscribe at any time."}
      </p>
    </form>
  );
}
