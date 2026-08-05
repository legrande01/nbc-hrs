import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { SearchSchemaInput } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { AuthSteps } from "@/components/nbc/AuthSteps";
import { OtpField } from "@/components/nbc/OtpField";
import { Button } from "@/components/ui/button";
import { resendSignupOtp, verifySignupOtp } from "@/lib/auth.functions";

export const Route = createFileRoute("/account/verify")({
  ssr: false,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => ({
    email: typeof search?.email === "string" ? search?.email : "",
  }),
  head: () => ({
    meta: [
      { title: "Verify your account · NBC Hospitality" },
      {
        name: "description",
        content:
          "Confirm the one-time codes sent to your email address and phone number to activate your NBC Hospitality account.",
      },
      { property: "og:title", content: "Verify your account · NBC Hospitality" },
      {
        property: "og:description",
        content: "Enter the 6-digit codes to activate your NBC Hospitality account.",
      },
    ],
  }),
  component: VerifyPage,
});

const REGISTRATION_STEPS = ["Account details", "Verification"];

function VerifyPage() {
  const { email } = useSearch({ from: "/account/verify" });
  const navigate = useNavigate();
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [busy, setBusy] = useState<"email" | "phone" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) void navigate({ to: "/account/register" });
  }, [email, navigate]);

  async function verify(channel: "email" | "phone") {
    const code = channel === "email" ? emailCode : phoneCode;
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(channel);
    setError(null);
    setNotice(null);
    try {
      const result = await verifySignupOtp({ data: { email, channel, code } });
      if (!result.verified) {
        setError("That code is incorrect or has expired. Request a new one.");
        return;
      }
      setEmailVerified(result.emailVerified);
      setPhoneVerified(result.phoneVerified);
      if (result.emailVerified && result.phoneVerified) {
        await navigate({ to: "/account/login", search: { next: "/account" } });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function resend(channel: "email" | "phone") {
    setError(null);
    try {
      const result = await resendSignupOtp({ data: { email, channel } });
      setNotice(
        `A new code was sent to your ${channel === "email" ? "email address" : "phone number"}. Demo code: ${result.demoCode}`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resend the code.");
    }
  }

  return (
    <AuthShell
      eyebrow="Customer Account"
      title="Verify your details"
      description="We sent a 6-digit code to your email address and to your phone number. Confirm both to activate your account."
      footer={
        <p className="text-sm text-muted-foreground">
          Wrong details?{" "}
          <Link to="/account/register" className="font-medium text-nbc-royal hover:underline">
            Start again
          </Link>
        </p>
      }
    >
      <AuthSteps steps={REGISTRATION_STEPS} current={1} className="mb-6" />
      <AuthCard>
        <div className="grid gap-3">
          <OtpField
            id="email-otp"
            label="Email verification code"
            hint={`Sent to ${email}`}
            value={emailCode}
            onChange={setEmailCode}
            verified={emailVerified}
          />
          {!emailVerified ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => verify("email")}
                disabled={busy === "email"}
              >
                Verify email
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => resend("email")}>
                Resend code
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 border-t border-border/70 pt-5">
          <OtpField
            id="phone-otp"
            label="Phone verification code"
            hint="Sent by SMS to your registered phone number"
            value={phoneCode}
            onChange={setPhoneCode}
            verified={phoneVerified}
          />
          {!phoneVerified ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => verify("phone")}
                disabled={busy === "phone"}
              >
                Verify phone
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => resend("phone")}>
                Resend code
              </Button>
            </div>
          ) : null}
        </div>

        {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-nbc-scarlet">
            {error}
          </p>
        ) : null}
      </AuthCard>
    </AuthShell>
  );
}
