import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { AuthSteps } from "@/components/nbc/AuthSteps";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerCustomer } from "@/lib/auth.functions";
import { customerRegistrationSchema } from "@/lib/auth-schemas";

export const Route = createFileRoute("/account/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your NBC Hospitality account" },
      {
        name: "description",
        content:
          "Create an NBC Hospitality account to book verified hotels across Tanzania, keep your reservations together and earn membership benefits.",
      },
      { property: "og:title", content: "Create your NBC Hospitality account" },
      {
        property: "og:description",
        content: "Register in two steps and verify your email and phone number.",
      },
    ],
  }),
  component: CustomerRegisterPage,
});

const REGISTRATION_STEPS = ["Account details", "Verification"];

function CustomerRegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = customerRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});

    if (!accepted) {
      setFormError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setBusy(true);
    try {
      const result = await registerCustomer({
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          password: parsed.data.password,
        },
      });
      await navigate({
        to: "/account/verify",
        search: { email: result.email },
      });
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Registration failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Customer Account"
      title="Create your account"
      description="One account for your reservations, preferences and NBC Hospitality membership."
      footer={
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/account/login" className="font-medium text-nbc-royal hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <AuthSteps steps={REGISTRATION_STEPS} current={0} className="mb-6" />
      <form onSubmit={handleSubmit}>
        <AuthCard>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(event) => update("firstName", event.target.value)}
              />
              {errors.firstName ? (
                <p className="text-xs text-nbc-scarlet">{errors.firstName}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(event) => update("lastName", event.target.value)}
              />
              {errors.lastName ? (
                <p className="text-xs text-nbc-scarlet">{errors.lastName}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
            {errors.email ? <p className="text-xs text-nbc-scarlet">{errors.email}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+255 7XX XXX XXX"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
            {errors.phone ? <p className="text-xs text-nbc-scarlet">{errors.phone}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
              />
              {errors.password ? (
                <p className="text-xs text-nbc-scarlet">{errors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, with a letter and a number.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-nbc-scarlet">{errors.confirmPassword}</p>
              ) : null}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
            <Checkbox
              className="mt-0.5"
              checked={accepted}
              onCheckedChange={(value) => setAccepted(value === true)}
            />
            <span>
              I agree to the NBC Hospitality Terms of Service and Privacy Policy, and consent to
              receiving reservation notifications.
            </span>
          </label>

          {formError ? (
            <p role="alert" className="text-sm text-nbc-scarlet">
              {formError}
            </p>
          ) : null}

          <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
            {busy ? "Creating account…" : "Continue to verification"}
          </Button>
        </AuthCard>
      </form>
    </AuthShell>
  );
}
