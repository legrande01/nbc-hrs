import { useMemo, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Download,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import { LinkNbcAccountDialog } from "@/components/nbc/LinkNbcAccountDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  formatPaymentDate,
  formatPaymentMoney,
  linkingSteps,
  nbcAccountBenefits,
  paymentChannelIcons,
  paymentChannelLabels,
  paymentHistory,
  paymentSecurityPoints,
  paymentStatusClasses,
  paymentStatusLabels,
  summarisePayments,
  type LinkedNbcAccount,
  type PaymentRecord,
} from "@/lib/nbc-payments-history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/payments")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({ to: "/account/login", search: { next: "/account/payments" } });
  },
  head: () => ({
    meta: [
      { title: "Payments · NBC Hospitality" },
      {
        name: "description",
        content:
          "Link your NBC Account and review every payment made for your NBC Hospitality stays.",
      },
      { property: "og:title", content: "Payments · NBC Hospitality" },
      {
        property: "og:description",
        content: "Manage your linked NBC Account and track payments for your stays.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [accounts, setAccounts] = useState<LinkedNbcAccount[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selected, setSelected] = useState<PaymentRecord | null>(null);

  const summary = useMemo(() => summarisePayments(paymentHistory), []);
  const hasAccounts = accounts.length > 0;

  const handleLinked = (account: LinkedNbcAccount) => {
    setAccounts((prev) => [...prev, account]);
    toast.success("NBC Account linked and verified");
  };

  const removeAccount = (id: string) => {
    setAccounts((prev) => prev.filter((account) => account.id !== id));
    toast("NBC Account unlinked");
  };

  return (
    <AccountLayout>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Payments
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Manage your linked NBC Account and keep track of payments made for your stays.
        </p>
      </header>

      <Tabs defaultValue="nbc-account" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="nbc-account">NBC Account</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------- */}
        <TabsContent value="nbc-account" className="mt-6 grid gap-6">
          {hasAccounts ? (
            <LinkedAccountsPanel
              accounts={accounts}
              onAdd={() => setLinkOpen(true)}
              onManage={() => setManageOpen(true)}
            />
          ) : (
            <UnlinkedPanel onLink={() => setLinkOpen(true)} />
          )}
          <HowItWorksCard />
          <SecurityCard />
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        <TabsContent value="history" className="mt-6 grid gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Payments"
              value={summary.total}
              hint="Across your stays"
            />
            <SummaryCard
              label="Completed"
              value={summary.completed}
              hint={formatPaymentMoney(summary.completedAmount)}
            />
            <SummaryCard
              label="Refunded"
              value={summary.refunded}
              hint={formatPaymentMoney(summary.refundedAmount)}
            />
          </div>

          <AccountCard>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Payment history
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Payments made against your hotel stays. Select a payment to see the full record.
            </p>

            {paymentHistory.length === 0 ? (
              <AccountEmptyState
                className="mt-6"
                title="No payments yet"
                description="Payments for your stays will appear here once you complete a booking."
                action={
                  <Button asChild>
                    <Link to="/hotels">Explore Hotels</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="mt-6 grid gap-3">
                {paymentHistory.map((record) => {
                  const Icon = paymentChannelIcons[record.channel];
                  return (
                    <li key={record.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(record)}
                        className="grid w-full gap-4 rounded-xl border border-border/70 bg-card p-4 text-left transition-colors hover:border-nbc-royal/30 hover:bg-secondary/40 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
                      >
                        <span
                          aria-hidden="true"
                          className="grid size-10 shrink-0 place-items-center rounded-full bg-nbc-royal/10 text-nbc-royal"
                        >
                          <Icon className="size-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {record.hotelName}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {formatPaymentDate(record.paidOn)} · {record.reservationReference}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {paymentChannelLabels[record.channel]} · {record.channelDetail}
                          </span>
                        </span>
                        <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {formatPaymentMoney(record.amount, record.currency)}
                          </span>
                          <StatusPill status={record.status} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </AccountCard>

          <SecurityCard />
        </TabsContent>
      </Tabs>

      <LinkNbcAccountDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        linkedMaskedNumbers={accounts.map((account) => account.maskedNumber)}
        onLinked={handleLinked}
      />

      <ManageAccountsDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        accounts={accounts}
        onRemove={removeAccount}
      />

      <PaymentDetailsDialog record={selected} onClose={() => setSelected(null)} />
    </AccountLayout>
  );
}

/* ------------------------------------------------------------------ */

function SummaryCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <AccountCard className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </AccountCard>
  );
}

function StatusPill({ status }: { status: PaymentRecord["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        paymentStatusClasses[status],
      )}
    >
      {paymentStatusLabels[status]}
    </span>
  );
}

function UnlinkedPanel({ onLink }: { onLink: () => void }) {
  return (
    <AccountCard>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-nbc-gold/20 text-nbc-royal"
          >
            <Sparkles className="size-5" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            Link your NBC Account
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
            Linking your NBC Account unlocks a smoother checkout and member-only value across the
            NBC Hospitality network.
          </p>
          <ul className="mt-4 grid gap-2">
            {nbcAccountBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-nbc-royal"
                  strokeWidth={1.75}
                />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <Button variant="scarlet" size="lg" onClick={onLink} className="shrink-0">
          Link NBC Account
        </Button>
      </div>
    </AccountCard>
  );
}

function LinkedAccountsPanel({
  accounts,
  onAdd,
  onManage,
}: {
  accounts: LinkedNbcAccount[];
  onAdd: () => void;
  onManage: () => void;
}) {
  return (
    <AccountCard>
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-full bg-nbc-royal/10 text-nbc-royal"
        >
          <BadgeCheck className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            NBC Account Linked
          </h2>
          <p className="text-sm text-muted-foreground">Verified &amp; Linked</p>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="rounded-xl border border-border/70 bg-secondary/30 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">NBC Account</p>
                <p className="mt-1 text-lg font-semibold tracking-wide text-foreground">
                  {account.maskedNumber}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.accountName} · {account.branch}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Linked on {formatPaymentDate(account.linkedOn)}
                </p>
              </div>
              {account.primary ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-nbc-gold/40 bg-nbc-gold/15 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  <Star aria-hidden="true" className="size-3" strokeWidth={2} />
                  Primary
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl border border-border/70 p-4">
        <p className="text-sm font-semibold text-foreground">Benefits unlocked</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3">
          {["Pay from NBC Account", "Eligible Loyalty Points", "Eligible NBC member offers"].map(
            (benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-nbc-royal"
                  strokeWidth={1.75}
                />
                {benefit}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onAdd}>
          <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
          Add Another NBC Account
        </Button>
        <Button variant="outline" onClick={onManage}>
          Manage Linked Accounts
        </Button>
      </div>
    </AccountCard>
  );
}

function HowItWorksCard() {
  return (
    <AccountCard>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">How it works</h2>
      <ol className="mt-4 grid gap-3">
        {linkingSteps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm text-foreground">
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-nbc-royal text-xs font-semibold text-primary-foreground"
            >
              {index + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The one-time code always goes to the phone number registered to the NBC Account being
        linked — never to another number on your profile. Every account, including additional ones,
        is verified this way.
      </p>
    </AccountCard>
  );
}

function SecurityCard() {
  return (
    <AccountCard>
      <div className="flex items-start gap-3">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-nbc-royal"
          strokeWidth={1.75}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Your payment information is protected.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">NBC HRS does not store:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {paymentSecurityPoints.map((point) => (
              <li
                key={point}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Only the transaction information required for your reservations and payment history is
            displayed.
          </p>
        </div>
      </div>
    </AccountCard>
  );
}

function ManageAccountsDialog({
  open,
  onOpenChange,
  accounts,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: LinkedNbcAccount[];
  onRemove: (id: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage linked accounts</DialogTitle>
          <DialogDescription>
            Account numbers are always masked. Unlinking removes the account from checkout.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-3">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-wide text-foreground">
                  {account.maskedNumber}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {account.branch} · Linked {formatPaymentDate(account.linkedOn)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onRemove(account.id)}>
                Unlink
              </Button>
            </li>
          ))}
        </ul>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No NBC Accounts are linked right now.</p>
        ) : null}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDetailsDialog({
  record,
  onClose,
}: {
  record: PaymentRecord | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={record !== null} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {record ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment details</DialogTitle>
              <DialogDescription>{record.hotelName}</DialogDescription>
            </DialogHeader>

            <dl className="grid gap-3 rounded-xl border border-border/70 p-4 text-sm sm:grid-cols-2">
              <DetailRow label="Hotel" value={record.hotelName} />
              <DetailRow label="Booking Reference" value={record.reservationReference} />
              <DetailRow label="Payment Date" value={formatPaymentDate(record.paidOn)} />
              <DetailRow
                label="Payment Channel"
                value={`${paymentChannelLabels[record.channel]} · ${record.channelDetail}`}
              />
              <DetailRow
                label="Amount"
                value={formatPaymentMoney(record.amount, record.currency)}
              />
              <DetailRow label="Transaction Reference" value={record.transactionReference} />
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Payment Status
                </dt>
                <dd className="mt-1">
                  <StatusPill status={record.status} />
                </dd>
              </div>
              {record.note ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Note</dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground">{record.note}</dd>
                </div>
              ) : null}
            </dl>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Banknote aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-nbc-royal" />
              Only transaction information is shown. Card numbers, CVV and PINs are never stored.
            </p>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" asChild>
                <Link
                  to="/account/reservations/$reference"
                  params={{ reference: record.reservationReference }}
                >
                  View Reservation
                </Link>
              </Button>
              <Button onClick={() => toast.success("Receipt download will be available soon")}>
                <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Download Receipt
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}
