import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, FileText, LogOut, ShieldCheck } from "lucide-react";

import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getMyPartnerApplication, updateMyPartnerApplication } from "@/lib/partner.functions";
import type { PartnerApplication } from "@/lib/partner.server";
import { signOutEverywhere } from "@/lib/nbc-session";

export const Route = createFileRoute("/partners/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/partners/login", search: { next: "/partners/dashboard" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Partner dashboard · NBC Hospitality" },
      {
        name: "description",
        content:
          "Track your NBC Hospitality partner application status and upload the documents required for property verification.",
      },
      { property: "og:title", content: "Partner dashboard · NBC Hospitality" },
      {
        property: "og:description",
        content: "Application status and document upload for NBC Hospitality hotel partners.",
      },
    ],
  }),
  component: PartnerDashboardPage,
});

const STATUS_COPY: Record<string, { label: string; description: string }> = {
  pending: {
    label: "Under review",
    description:
      "Your application is with our onboarding team. Most reviews complete within 3 business days.",
  },
  approved: {
    label: "Approved",
    description:
      "Your property is verified. Full operations tools are being enabled for your account.",
  },
  rejected: {
    label: "Not approved",
    description:
      "Your application was not approved. Review the notes below and contact partner support.",
  },
};

function DocumentUpload({
  id,
  label,
  currentPath,
  userId,
  onUploaded,
}: {
  id: string;
  label: string;
  currentPath: string | null;
  userId: string;
  onUploaded: (path: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const path = `${userId}/${id}-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("partner-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      await onUploaded(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept="application/pdf,image/*"
        disabled={busy}
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground">
        {currentPath ? "Uploaded — upload again to replace." : "PDF or image, up to 10 MB."}
      </p>
      {error ? <p className="text-xs text-nbc-scarlet">{error}</p> : null}
    </div>
  );
}

function PartnerDashboardPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
    void getMyPartnerApplication()
      .then((result) => setApplication(result.application as PartnerApplication | null))
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, []);

  async function saveDocument(field: "licenseDocumentPath" | "tinDocumentPath", path: string) {
    const result = await updateMyPartnerApplication({ data: { [field]: path } });
    setApplication(result.application as PartnerApplication | null);
  }

  async function handleSignOut() {
    await signOutEverywhere();
    await navigate({ to: "/" });
  }

  const status = application ? (STATUS_COPY[application.status] ?? STATUS_COPY.pending) : null;
  const restricted = application?.status !== "approved";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Hotel Partners</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {application?.hotelName ?? "Partner dashboard"}
            </h1>
            {application ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Application {application.reference}
              </p>
            ) : null}
          </div>
          <Button variant="outline" className="gap-2" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your application…</p>
        ) : null}

        {!loading && !application ? (
          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">
              We could not find a partner application for this account.
            </p>
            <Button variant="scarlet" className="mt-4" asChild>
              <Link to="/partners/register">Start an application</Link>
            </Button>
          </div>
        ) : null}

        {application ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <section className="grid gap-5">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText aria-hidden="true" className="size-5 text-nbc-royal" />
                  Verification documents
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload your business licence and TIN certificate. Only your team and NBC
                  onboarding can see them.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DocumentUpload
                    id="license"
                    label="Business licence"
                    currentPath={application.licenseDocumentPath}
                    userId={userId}
                    onUploaded={(path) => saveDocument("licenseDocumentPath", path)}
                  />
                  <DocumentUpload
                    id="tin"
                    label="TIN certificate"
                    currentPath={application.tinDocumentPath}
                    userId={userId}
                    onUploaded={(path) => saveDocument("tinDocumentPath", path)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <h2 className="text-lg font-semibold text-foreground">Property summary</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Type</dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {application.propertyType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Rooms</dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {application.roomCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Location
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {application.district}, {application.region}, {application.country}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      Business contact
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {application.businessEmail}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <aside className="grid gap-5">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Clock aria-hidden="true" className="size-5 text-nbc-royal" />
                  {status?.label}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {status?.description}
                </p>
                {application.reviewNotes ? (
                  <p className="mt-3 rounded-xl bg-secondary p-3 text-sm text-foreground">
                    {application.reviewNotes}
                  </p>
                ) : null}
              </div>

              {restricted ? (
                <div className="rounded-2xl border border-nbc-gold/40 bg-nbc-gold/10 p-6">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <ShieldCheck aria-hidden="true" className="size-5 text-nbc-royal" />
                    Restricted access
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Rooms, rates, bookings and reporting unlock once your property is approved.
                    Until then you can complete your documents and details.
                  </p>
                  {isHotelAdminDevBypassEnabled ? (
                    <Button variant="outline" className="mt-4" asChild>
                      <Link to="/hotel/dashboard">
                        Preview {demoHotelAdmin.name} dashboard (dev only)
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </main>
      <GlobalFooter />
    </div>
  );
}
