import { useMemo, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, LogOut, Pencil, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountLayout } from "@/components/nbc/AccountLayout";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { initialsFor } from "@/lib/nbc-dashboard";
import { signOutEverywhere } from "@/lib/nbc-session";
import {
  accessibilityOptions,
  bedTypeOptions,
  currencyOptions,
  demoCommunicationPreferences,
  demoPersonalInformation,
  demoRegionPreferences,
  demoTravelPreferences,
  dietaryOptions,
  formatDateOfBirth,
  languageOptions,
  memberSince,
  profileCompletion,
  smokingOptions,
  timeZoneOptions,
  type CommunicationPreferences,
  type PersonalInformation,
  type RegionPreferences,
  type TravelPreferences,
} from "@/lib/nbc-settings";

export const Route = createFileRoute("/account/settings")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account/settings" } });
  },
  head: () => ({
    meta: [
      { title: "Profile & settings · NBC Hospitality" },
      {
        name: "description",
        content:
          "Manage your personal details, communication and travel preferences, security and region settings.",
      },
      { property: "og:title", content: "Profile & settings · NBC Hospitality" },
      {
        property: "og:description",
        content: "Personalise your NBC Hospitality profile, preferences and security settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

/** Section wrapper matching the account card rhythm used elsewhere. */
function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AccountCard>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </AccountCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const [personal, setPersonal] = useState<PersonalInformation>(demoPersonalInformation);
  const [draft, setDraft] = useState<PersonalInformation>(demoPersonalInformation);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [comms, setComms] = useState<CommunicationPreferences>(demoCommunicationPreferences);
  const [travel, setTravel] = useState<TravelPreferences>(demoTravelPreferences);
  const [region, setRegion] = useState<RegionPreferences>(demoRegionPreferences);

  const completion = useMemo(() => profileCompletion(personal), [personal]);
  const fullName = `${personal.firstName} ${personal.lastName}`.trim();

  const updateComms = (key: keyof CommunicationPreferences) => (value: boolean) => {
    setComms((prev) => ({ ...prev, [key]: value }));
    toast.success("Preference updated");
  };

  const updateTravel = <K extends keyof TravelPreferences>(
    key: K,
    value: TravelPreferences[K],
  ) => {
    setTravel((prev) => ({ ...prev, [key]: value }));
    toast.success("Travel preference saved");
  };

  const updateRegion = (key: keyof RegionPreferences) => (value: string) => {
    setRegion((prev) => ({ ...prev, [key]: value }));
    toast.success("Preference updated");
  };

  const saveProfile = () => {
    setPersonal(draft);
    setEditOpen(false);
    toast.success("Profile updated");
  };

  const logout = async () => {
    await signOutEverywhere();
    toast.success("Signed out");
    void navigate({ to: "/" });
  };

  return (
    <AccountLayout>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Profile &amp; settings
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Keep your details current so every stay feels prepared for you in advance.
        </p>
      </header>

      <AccountCard className="mt-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-center">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-16 shrink-0 place-items-center rounded-full bg-nbc-royal text-lg font-semibold text-primary-foreground"
            >
              {initialsFor(personal.firstName, personal.lastName, personal.email)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold tracking-tight text-foreground">
                {fullName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Member since {memberSince}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-nbc-royal/10 px-2.5 py-1 text-xs font-semibold text-nbc-royal">
                <BadgeCheck aria-hidden="true" className="size-3.5" strokeWidth={2} />
                Email &amp; phone verified
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-secondary/20 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{completion}% Complete</p>
              <p className="text-xs text-muted-foreground">Profile completion</p>
            </div>
            <Progress value={completion} className="mt-3" />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Complete your profile for a more personalized booking experience.
            </p>
          </div>
        </div>
      </AccountCard>

      <div className="mt-6 grid gap-6">
        <SettingsSection
          title="Personal information"
          description="The details we use on your reservations and confirmations."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setDraft(personal);
                setEditOpen(true);
              }}
            >
              <Pencil aria-hidden="true" className="size-4" strokeWidth={1.75} />
              Edit Profile
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailRow label="First name" value={personal.firstName} />
            <DetailRow label="Last name" value={personal.lastName} />
            <DetailRow label="Email address" value={personal.email} />
            <DetailRow label="Phone number" value={personal.phone} />
            <DetailRow label="Date of birth" value={formatDateOfBirth(personal.dateOfBirth)} />
            <DetailRow label="Nationality" value={personal.nationality} />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Communication preferences"
          description="Choose what we tell you about, and how we reach you."
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <ToggleRow
              label="Reservation Updates"
              description="Confirmations, changes and check-in reminders."
              checked={comms.reservationUpdates}
              onChange={updateComms("reservationUpdates")}
            />
            <ToggleRow
              label="Payment Notifications"
              description="Receipts, refunds and pending balances."
              checked={comms.paymentNotifications}
              onChange={updateComms("paymentNotifications")}
            />
            <ToggleRow
              label="Rewards & Loyalty"
              description="Points earned and milestone rewards."
              checked={comms.rewardsLoyalty}
              onChange={updateComms("rewardsLoyalty")}
            />
            <ToggleRow
              label="Promotions & Offers"
              description="Seasonal rates and member-only escapes."
              checked={comms.promotions}
              onChange={updateComms("promotions")}
            />
            <ToggleRow
              label="Email Notifications"
              description="Send updates to your registered email address."
              checked={comms.email}
              onChange={updateComms("email")}
            />
            <ToggleRow
              label="SMS Notifications"
              description="Send short updates to your mobile number."
              checked={comms.sms}
              onChange={updateComms("sms")}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Travel preferences"
          description="We'll share these with hotels so future bookings arrive prefilled."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="bed-type">Preferred bed type</Label>
              <Select
                value={travel.bedType}
                onValueChange={(value) => updateTravel("bedType", value)}
              >
                <SelectTrigger id="bed-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bedTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smoking">Smoking preference</Label>
              <Select
                value={travel.smoking}
                onValueChange={(value) => updateTravel("smoking", value)}
              >
                <SelectTrigger id="smoking">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {smokingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accessibility">Accessibility requirements</Label>
              <Select
                value={travel.accessibility}
                onValueChange={(value) => updateTravel("accessibility", value)}
              >
                <SelectTrigger id="accessibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accessibilityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dietary">Dietary preferences</Label>
              <Select
                value={travel.dietary}
                onValueChange={(value) => updateTravel("dietary", value)}
              >
                <SelectTrigger id="dietary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dietaryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 xl:col-span-1">
              <ToggleRow
                label="High floor preference"
                description="Request an upper-floor room where available."
                checked={travel.highFloor}
                onChange={(value) => updateTravel("highFloor", value)}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Security"
          description="Protect your account and the reservations tied to it."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="mt-1 text-xs text-muted-foreground">•••••••••••</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPasswordOpen(true)}>
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-secondary/20 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  Two-Factor Authentication
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-secondary/20 p-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Smartphone aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  Active Devices
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Language & region"
          description="How prices, dates and messages are presented to you."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={region.language} onValueChange={updateRegion("language")}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={region.currency} onValueChange={updateRegion("currency")}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Time zone</Label>
              <Select value={region.timeZone} onValueChange={updateRegion("timeZone")}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeZoneOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Account" description="Legal information and account controls.">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Button variant="outline" asChild>
              <a href="/#privacy">Privacy Policy</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/#terms">Terms &amp; Conditions</a>
            </Button>
            <Button variant="outline" onClick={() => void logout()}>
              <LogOut aria-hidden="true" className="size-4" strokeWidth={1.75} />
              Logout
            </Button>
            <Button
              variant="outline"
              disabled
              className="text-nbc-scarlet"
              aria-label="Delete account, coming soon"
            >
              Delete Account · Coming Soon
            </Button>
          </div>
        </SettingsSection>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update the details we use across your reservations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={draft.firstName}
                onChange={(event) => setDraft({ ...draft, firstName: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={draft.lastName}
                onChange={(event) => setDraft({ ...draft, lastName: event.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={draft.phone}
                onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of birth</Label>
              <Input
                id="dob"
                type="date"
                value={draft.dateOfBirth}
                onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={draft.nationality}
                onChange={(event) => setDraft({ ...draft, nationality: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProfile}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Choose a password you don't use anywhere else.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" autoComplete="current-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPasswordOpen(false);
                toast.success("Password updated");
              }}
            >
              Update password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountLayout>
  );
}
