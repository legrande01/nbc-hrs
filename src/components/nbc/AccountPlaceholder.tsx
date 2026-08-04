import { Link } from "@tanstack/react-router";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { Button } from "@/components/ui/button";

interface AccountPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * Shared shell for account modules that are not part of this sprint.
 * Keeps the sidebar navigation honest — every menu item leads somewhere real.
 */
export function AccountPlaceholder({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: AccountPlaceholderProps) {
  return (
    <AccountLayout>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>
      <AccountCard className="mt-8">
        <AccountEmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button variant="outline" asChild>
              <Link to="/account">Back to dashboard</Link>
            </Button>
          }
        />
      </AccountCard>
    </AccountLayout>
  );
}
