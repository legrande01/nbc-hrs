import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
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
  onSubmit: (owner: ReservationOwner) => void;
}

function Group({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
      <legend className="sr-only">{title}</legend>
      <div>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">{eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </fieldset>
  );
}

/**
 * Collects only what the reservation owner must provide.
 * Guest assignment and room assignment stay with Reception at check-in.
 */
export function ReservationOwnerForm({ initial, onSubmit }: ReservationOwnerFormProps) {
  const [owner, setOwner] = useState<ReservationOwner>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ReservationOwner>(key: K, value: ReservationOwner[K]) {
    setOwner((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!owner.fullName.trim()) next.fullName = "Please enter the reservation owner's full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (owner.phone.trim().length < 9) next.phone = "Please enter a reachable phone number.";
    if (!owner.country) next.country = "Please select a country.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      ...owner,
      fullName: owner.fullName.trim(),
      email: owner.email.trim(),
      phone: owner.phone.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6">
      <Group
        eyebrow="Step 1"
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
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName ? (
              <p className="text-xs text-destructive">{errors.fullName}</p>
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
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
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
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
          </div>
        </div>
      </Group>

      <Group
        eyebrow="Step 2"
        title="Traveller Information"
        description="Helps the hotel prepare for your arrival and lets us communicate in your language."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="country">Country / nationality</Label>
            <Select value={owner.country} onValueChange={(value) => set("country", value)}>
              <SelectTrigger id="country" aria-invalid={Boolean(errors.country)}>
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
            {errors.country ? <p className="text-xs text-destructive">{errors.country}</p> : null}
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
      </Group>

      <Group
        eyebrow="Optional"
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
      </Group>

      <ComplianceNotice />

      <div className="flex justify-end">
        <Button type="submit" size="xl">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
