import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { OtpField } from "@/components/nbc/OtpField";
import { AuthSteps } from "@/components/nbc/AuthSteps";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  OTP_RESEND_SECONDS,
  sendNbcAccountOtp,
  validateNbcAccount,
  verifyNbcAccountOtp,
  type LinkedNbcAccount,
  type ValidatedNbcAccount,
} from "@/lib/nbc-payments-history";

interface LinkNbcAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Masked numbers already linked, so duplicates are rejected on validation. */
  linkedMaskedNumbers: string[];
  onLinked: (account: LinkedNbcAccount) => void;
}

type Stage = "details" | "otp" | "success";

const stageLabels = ["Account", "Verify", "Linked"];

/**
 * Secure NBC Account linking flow.
 * Every account — including additional ones — goes through validation and an
 * OTP sent to the phone registered to that NBC Account. The OTP step can never
 * be skipped.
 */
export function LinkNbcAccountDialog({
  open,
  onOpenChange,
  linkedMaskedNumbers,
  onLinked,
}: LinkNbcAccountDialogProps) {
  const [stage, setStage] = useState<Stage>("details");
  const [accountNumber, setAccountNumber] = useState("");
  const [account, setAccount] = useState<ValidatedNbcAccount | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [linked, setLinked] = useState<LinkedNbcAccount | null>(null);

  useEffect(() => {
    if (!open) {
      setStage("details");
      setAccountNumber("");
      setAccount(null);
      setOtp("");
      setError(null);
      setBusy(false);
      setCooldown(0);
      setLinked(null);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const submitDetails = async () => {
    setError(null);
    setBusy(true);
    try {
      const validated = await validateNbcAccount(accountNumber, linkedMaskedNumbers);
      await sendNbcAccountOtp(validated);
      setAccount(validated);
      setCooldown(OTP_RESEND_SECONDS);
      setStage("otp");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not validate that account.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!account || cooldown > 0) return;
    setError(null);
    setBusy(true);
    try {
      await sendNbcAccountOtp(account);
      setCooldown(OTP_RESEND_SECONDS);
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async () => {
    if (!account) return;
    setError(null);
    setBusy(true);
    try {
      await verifyNbcAccountOtp(otp);
      const record: LinkedNbcAccount = {
        id: `nbc-${Date.now()}`,
        maskedNumber: account.maskedNumber,
        accountName: account.accountName,
        branch: account.branch,
        linkedOn: new Date().toISOString().slice(0, 10),
        maskedPhone: account.maskedPhone,
        primary: linkedMaskedNumbers.length === 0,
      };
      setLinked(record);
      onLinked(record);
      setStage("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const stageIndex = stage === "details" ? 0 : stage === "otp" ? 1 : 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link NBC Account</DialogTitle>
          <DialogDescription>
            We validate the account, then send a one-time code to the phone number registered to it.
          </DialogDescription>
        </DialogHeader>

        <AuthSteps steps={stageLabels} current={stageIndex} className="mb-2" />

        {stage === "details" ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitDetails();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="nbc-account-number">NBC Account number</Label>
              <Input
                id="nbc-account-number"
                inputMode="numeric"
                autoComplete="off"
                maxLength={24}
                placeholder="e.g. 0110 4821 0034"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We only ever store a masked reference to this account.
              </p>
            </div>
            {error ? <p className="text-sm font-medium text-nbc-scarlet">{error}</p> : null}
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
                Validate & send OTP
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {stage === "otp" && account ? (
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submitOtp();
            }}
          >
            <div className="rounded-xl border border-border/70 bg-secondary/40 p-4 text-sm">
              <p className="font-medium text-foreground">
                OTP sent to {account.maskedPhone}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Sent to the phone number registered to {account.maskedNumber} — not to your NBC HRS
                profile number.
              </p>
            </div>
            <OtpField
              id="nbc-account-otp"
              label="Enter the 6-digit code"
              hint="Demo code: 123456"
              value={otp}
              onChange={setOtp}
              disabled={busy}
            />
            {error ? <p className="text-sm font-medium text-nbc-scarlet">{error}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={cooldown > 0 || busy}
                onClick={() => void resend()}
              >
                Resend OTP
              </Button>
              {cooldown > 0 ? (
                <span className="text-xs text-muted-foreground">
                  You can request a new code in {cooldown}s
                </span>
              ) : null}
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setStage("details")}>
                Back
              </Button>
              <Button type="submit" disabled={busy || otp.length !== 6}>
                {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
                Verify & link
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {stage === "success" && linked ? (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-xl border border-nbc-royal/25 bg-nbc-royal/[0.06] p-5 text-center">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto size-9 text-nbc-royal"
                strokeWidth={1.75}
              />
              <p className="text-base font-semibold text-foreground">NBC Account Linked</p>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">NBC Account</p>
                <p className="mt-1 text-lg font-semibold tracking-wide text-foreground">
                  {linked.maskedNumber}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Linked and verified</p>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-nbc-royal" />
              No card numbers, PINs or reusable payment credentials are stored by NBC HRS.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
