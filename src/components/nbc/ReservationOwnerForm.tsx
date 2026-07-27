import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComplianceNotice } from "@/components/nbc/ComplianceNotice";
import type { ReservationOwner } from "@/lib/nbc-booking-flow";
import { cn } from "@/lib/utils";

const countries = [
  "Tanzania",
  "Kenya",
  "Uganda",
  "Rwanda",
  "Burundi",
  "South Africa",
  "United Kingdom",
  "United States",
  "India",
  "China",
  "Germany",
  "Other",
];

interface ReservationOwnerFormProps {
  initial: ReservationOwner;
  /** Emits the current draft and whether every mandatory field is complete. */
  onChange: (owner: ReservationOwner, valid: boolean) => void;
  className?: string;
}

/** Validation lives next to the shape it validates so the CTA can react to it. */
export function validateOwner(owner: ReservationOwner): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!owner.fullName.trim()) errors.fullName = "Please enter the reservation owner's full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (owner.phone.trim().length < 9) errors.phone = "Please enter a reachable phone number.";
  if (!owner.country) errors.country = "Please select a country.";
  return errors;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-5">
      <legend className="sr-only">{title}</legend>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </fieldset>
  );
}

/**
 * Collects only what the reservation owner must provide, as one unified card.
 * Guest assignment and room assignment stay with Reception at check-in.
 * The primary action lives in the Reservation Summary, so this form has none.
 */
export function ReservationOwnerForm({ initial, onChange, className }: ReservationOwnerFormProps) {
  const [owner, setOwner] = useState<ReservationOwner>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = validateOwner(owner);

  useEffect(() => {
    onChange(owner, Object.keys(validateOwner(owner)).length === 0);
  }, [owner, onChange]);

  function set<K extends keyof ReservationOwner>(key: K, value: ReservationOwner[K]) {
    setOwner((prev) => ({ ...prev, [key]: value }));
  }

  function blur(key: string) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  function errorFor(key: string) {
    return touched[key] ? errors[key] : undefined;
  }

  return (
    <form
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className={cn(
        "grid gap-10 rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8",
        className,
      )}
    >
      <div>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Your Details</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          Reservation details
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Everything we need to confirm your stay, in one place.
        </p>
      </div>

      <Section
        title="Contact Information"
        description="We use these details to send your booking confirmation and to reach you about your stay."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={owner.fullName}
              autoComplete="name"
              onChange={(event) => set("fullName", event.target.value)}
              onBlur={() => blur("fullName")}
              aria-invalid={Boolean(errorFor("fullName"))}
            />
            {errorFor("fullName") ? (
              <p className="text-xs text-destructive">{errorFor("fullName")}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={owner.email}
              autoComplete="email"
              onChange={(event) => set("email", event.target.value)}
              onBlur={() => blur("email")}
              aria-invalid={Boolean(errorFor("email"))}
            />
            {errorFor("email") ? (
              <p className="text-xs text-destructive">{errorFor("email")}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+255 700 000 000"
              value={owner.phone}
              autoComplete="tel"
              onChange={(event) => set("phone", event.target.value)}
              onBlur={() => blur("phone")}
              aria-invalid={Boolean(errorFor("phone"))}
            />
            {errorFor("phone") ? (
              <p className="text-xs text-destructive">{errorFor("phone")}</p>
            ) : null}
          </div>
        </div>
      </Section>

      <Section
        title="Traveller Information"
        description="Helps the hotel prepare for your arrival and lets us communicate in your language."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="country">Country / nationality</Label>
            <Select value={owner.country} onValueChange={(value) => set("country", value)}>
              <SelectTrigger id="country" aria-invalid={Boolean(errorFor("country"))}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorFor("country") ? (
              <p className="text-xs text-destructive">{errorFor("country")}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="language">Preferred language</Label>
            <Select
              value={owner.preferredLanguage}
              onValueChange={(value) => set("preferredLanguage", value as "en" | "sw")}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Confirmations and updates will be sent in this language.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Arrival &amp; Preferences"
        description="Optional details the hotel will do its best to accommodate."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="arrivalTime">Estimated arrival time</Label>
            <Input
              id="arrivalTime"
              type="time"
              value={owner.arrivalTime}
              onChange={(event) => set("arrivalTime", event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="specialRequests">Special requests</Label>
            <Textarea
              id="specialRequests"
              rows={4}
              placeholder="Late check-in, high floor, quiet room, dietary needs…"
              value={owner.specialRequests}
              onChange={(event) => set("specialRequests", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Requests are not guaranteed and are subject to availability at check-in.
            </p>
          </div>
        </div>
      </Section>

      <ComplianceNotice />
    </form>
  );
}
