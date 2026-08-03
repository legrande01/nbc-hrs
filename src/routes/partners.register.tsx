import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, AuthShell } from "@/components/nbc/AuthShell";
import { AuthSteps } from "@/components/nbc/AuthSteps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  adminAccountSchema,
  businessInfoSchema,
  propertyInfoSchema,
  propertyTypeOptions,
} from "@/lib/auth-schemas";
import { submitPartnerApplication } from "@/lib/partner.functions";

export const Route = createFileRoute("/partners/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "List your hotel · NBC Hospitality partners" },
      {
        name: "description",
        content:
          "Apply to list your property on NBC Hospitality. Submit your business details, property profile and administrator account in four guided steps.",
      },
      { property: "og:title", content: "List your hotel · NBC Hospitality partners" },
      {
        property: "og:description",
        content: "Join the curated NBC Hospitality network of verified hotels in Tanzania.",
      },
    ],
  }),
  component: PartnerRegisterPage,
});

const STEPS = ["Business info", "Property info", "Admin account", "Submitted"];

interface FormState {
  hotelName: string;
  tin: string;
  businessRegistrationNumber: string;
  businessEmail: string;
  businessPhone: string;
  propertyType: string;
  starRating: string;
  roomCount: string;
  country: string;
  region: string;
  district: string;
  physicalAddress: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
  confirmPassword: string;
}

const INITIAL: FormState = {
  hotelName: "",
  tin: "",
  businessRegistrationNumber: "",
  businessEmail: "",
  businessPhone: "",
  propertyType: "",
  starRating: "3",
  roomCount: "",
  country: "Tanzania",
  region: "",
  district: "",
  physicalAddress: "",
  adminFullName: "",
  adminEmail: "",
  adminPhone: "",
  password: "",
  confirmPassword: "",
};

function collectErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const next: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!next[key]) next[key] = issue.message;
  }
  return next;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-nbc-scarlet">{message}</p> : null;
}

function PartnerRegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  function update(field: keyof FormState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function goToPropertyInfo() {
    const parsed = businessInfoSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      return;
    }
    setErrors({});
    setStep(1);
  }

  function goToAdminAccount() {
    const parsed = propertyInfoSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = adminAccountSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error.issues));
      return;
    }
    setErrors({});

    setBusy(true);
    try {
      const result = await submitPartnerApplication({
        data: {
          hotelName: values.hotelName,
          tin: values.tin,
          businessRegistrationNumber: values.businessRegistrationNumber,
          businessEmail: values.businessEmail,
          businessPhone: values.businessPhone,
          propertyType: values.propertyType,
          starRating: Number(values.starRating),
          roomCount: Number(values.roomCount),
          country: values.country,
          region: values.region,
          district: values.district,
          physicalAddress: values.physicalAddress,
          adminFullName: values.adminFullName,
          adminEmail: values.adminEmail,
          adminPhone: values.adminPhone,
          password: values.password,
        },
      });
      setReference(result.reference);
      setStep(3);
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "We could not submit your application. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      wide
      eyebrow="Hotel Partners"
      title="List your property on NBC Hospitality"
      description="Four short steps. We verify every property before it appears in the guest marketplace."
      footer={
        step < 3 ? (
          <p className="text-sm text-muted-foreground">
            Already applied?{" "}
            <Link to="/partners/login" className="font-medium text-nbc-royal hover:underline">
              Sign in to your partner account
            </Link>
          </p>
        ) : null
      }
    >
      <AuthSteps steps={STEPS} current={step} className="mb-6" />

      {step === 0 ? (
        <AuthCard>
          <div className="grid gap-2">
            <Label htmlFor="hotelName">Hotel / business name</Label>
            <Input
              id="hotelName"
              value={values.hotelName}
              onChange={(event) => update("hotelName", event.target.value)}
            />
            <FieldError message={errors.hotelName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tin">TIN</Label>
              <Input
                id="tin"
                value={values.tin}
                onChange={(event) => update("tin", event.target.value)}
              />
              <FieldError message={errors.tin} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brn">Business registration number (optional)</Label>
              <Input
                id="brn"
                value={values.businessRegistrationNumber}
                onChange={(event) => update("businessRegistrationNumber", event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="businessEmail">Business email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={values.businessEmail}
                onChange={(event) => update("businessEmail", event.target.value)}
              />
              <FieldError message={errors.businessEmail} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessPhone">Business phone</Label>
              <Input
                id="businessPhone"
                type="tel"
                placeholder="+255 7XX XXX XXX"
                value={values.businessPhone}
                onChange={(event) => update("businessPhone", event.target.value)}
              />
              <FieldError message={errors.businessPhone} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You will be able to upload your business licence and TIN certificate from the partner
            dashboard once your account is created.
          </p>
          <Button type="button" variant="scarlet" size="lg" onClick={goToPropertyInfo}>
            Continue
          </Button>
        </AuthCard>
      ) : null}

      {step === 1 ? (
        <AuthCard>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="propertyType">Property type</Label>
              <Select
                value={values.propertyType}
                onValueChange={(value) => update("propertyType", value)}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={errors.propertyType} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="starRating">Star rating</Label>
              <Select
                value={values.starRating}
                onValueChange={(value) => update("starRating", value)}
              >
                <SelectTrigger id="starRating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SelectItem key={star} value={String(star)}>
                      {star} star
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="roomCount">Number of rooms</Label>
              <Input
                id="roomCount"
                inputMode="numeric"
                value={values.roomCount}
                onChange={(event) => update("roomCount", event.target.value)}
              />
              <FieldError message={errors.roomCount} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={values.country}
                onChange={(event) => update("country", event.target.value)}
              />
              <FieldError message={errors.country} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={values.region}
                onChange={(event) => update("region", event.target.value)}
              />
              <FieldError message={errors.region} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={values.district}
                onChange={(event) => update("district", event.target.value)}
              />
              <FieldError message={errors.district} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="physicalAddress">Physical address</Label>
            <Textarea
              id="physicalAddress"
              rows={3}
              value={values.physicalAddress}
              onChange={(event) => update("physicalAddress", event.target.value)}
            />
            <FieldError message={errors.physicalAddress} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="scarlet" size="lg" onClick={goToAdminAccount}>
              Continue
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
          </div>
        </AuthCard>
      ) : null}

      {step === 2 ? (
        <form onSubmit={handleSubmit}>
          <AuthCard>
            <div className="grid gap-2">
              <Label htmlFor="adminFullName">Administrator full name</Label>
              <Input
                id="adminFullName"
                value={values.adminFullName}
                onChange={(event) => update("adminFullName", event.target.value)}
              />
              <FieldError message={errors.adminFullName} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Administrator email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={values.adminEmail}
                  onChange={(event) => update("adminEmail", event.target.value)}
                />
                <FieldError message={errors.adminEmail} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adminPhone">Administrator phone</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={values.adminPhone}
                  onChange={(event) => update("adminPhone", event.target.value)}
                />
                <FieldError message={errors.adminPhone} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="partnerPassword">Password</Label>
                <Input
                  id="partnerPassword"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(event) => update("password", event.target.value)}
                />
                <FieldError message={errors.password} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="partnerConfirm">Confirm password</Label>
                <Input
                  id="partnerConfirm"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                />
                <FieldError message={errors.confirmPassword} />
              </div>
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-nbc-scarlet">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="scarlet" size="lg" disabled={busy}>
                {busy ? "Submitting…" : "Submit application"}
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </AuthCard>
        </form>
      ) : null}

      {step === 3 ? (
        <AuthCard>
          <h2 className="text-lg font-semibold text-foreground">Application submitted</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Thank you. Your application reference is{" "}
            <span className="font-semibold text-foreground">{reference}</span>. Our onboarding team
            reviews every property, typically within 3 business days. Sign in to upload your
            business licence and TIN certificate while you wait.
          </p>
          <Button
            variant="scarlet"
            size="lg"
            onClick={() =>
              navigate({ to: "/partners/login", search: { next: "/partners/dashboard" } })
            }
          >
            Go to partner sign in
          </Button>
        </AuthCard>
      ) : null}
    </AuthShell>
  );
}
