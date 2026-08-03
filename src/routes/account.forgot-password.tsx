import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { OtpField } from "@/components/nbc/OtpField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetOtp, resetPasswordWithOtp } from "@/lib/auth.functions";
import { passwordSchema } from "@/lib/auth-schemas";

export const Route = createFileRoute("/account/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password · NBC Hospitality" },
      {
        name: "description",
        content:
          "Request a one-time code and set a new password for your NBC Hospitality customer account.",
      },
      { property: "og:title", content: "Reset your password · NBC Hospitality" },
      {
        property: "og:description",
        content: "Recover access to your NBC Hospitality account with a one-time code.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [stage, setStage] = useState<"request" | "reset" | "done">("request");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await requestPasswordResetOtp({ data: { identifier } });
      if (result.email) setEmail(result.email);
      setNotice(
        result.demoCode
          ? `If an account exists, a reset code was sent. Demo code: ${result.demoCode}`
          : "If an account exists, a reset code has been sent.",
      );
      setStage("reset");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send a reset code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Choose a stronger password.");
      return;
    }
    if (!email) {
      setError("Enter the email address linked to your account and request a new code.");
      return;
    }

    setBusy(true);
    try {
      const result = await resetPasswordWithOtp({ data: { email, code, password } });
      if (!result.reset) {
        setError("That code is incorrect or has expired.");
        return;
      }
      setStage("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Customer Account"
      title="Reset your password"
      description="We will send a one-time code to the email address or phone number registered to your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/account/login" className="font-medium text-nbc-royal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {stage === "request" ? (
        <form onSubmit={handleRequest}>
          <AuthCard>
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email address or phone number</Label>
              <Input
                id="identifier"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-nbc-scarlet">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
              {busy ? "Sending code…" : "Send reset code"}
            </Button>
          </AuthCard>
        </form>
      ) : null}

      {stage === "reset" ? (
        <form onSubmit={handleReset}>
          <AuthCard>
            {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Account email address</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <OtpField id="reset-otp" label="Reset code" value={code} onChange={setCode} />
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-nbc-scarlet">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
              {busy ? "Updating…" : "Set new password"}
            </Button>
          </AuthCard>
        </form>
      ) : null}

      {stage === "done" ? (
        <AuthCard>
          <p className="text-sm text-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button variant="scarlet" size="lg" asChild>
            <Link to="/account/login" search={{ next: "/account" }}>
              Go to sign in
            </Link>
          </Button>
        </AuthCard>
      ) : null}
    </AuthShell>
  );
}
