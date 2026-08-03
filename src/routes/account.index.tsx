import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, LogOut, ShieldCheck, Sparkles } from "lucide-react";

import { AnnouncementBar } from "@/components/nbc/AnnouncementBar";
import { GlobalNav } from "@/components/nbc/GlobalNav";
import { GlobalFooter } from "@/components/nbc/GlobalFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { myReservations } from "@/lib/reservations.functions";
import type { ReservationRecord } from "@/lib/reservations.server";
import { signOutEverywhere, useNbcSession } from "@/lib/nbc-session";

export const Route = createFileRoute("/account/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/account/login", search: { next: "/account" } });
  },
  head: () => ({
    meta: [
      { title: "My account · NBC Hospitality" },
      {
        name: "description",
        content:
          "Manage your NBC Hospitality profile, review your reservations and prepare your NBC account link.",
      },
      { property: "og:title", content: "My account · NBC Hospitality" },
      {
        property: "og:description",
        content: "Your NBC Hospitality reservations and profile in one place.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { profile, loading } = useNbcSession();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);

  useEffect(() => {
    void myReservations()
      .then((result) => setReservations(result.reservations as ReservationRecord[]))
      .catch(() => setReservations([]));
  }, []);

  async function handleSignOut() {
    await signOutEverywhere();
    await navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <GlobalNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 lg:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Customer Account</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {loading ? "Welcome back" : `Welcome back, ${profile?.firstName || "guest"}`}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile?.email} {profile?.phone ? `· ${profile.phone}` : null}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
          <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarDays aria-hidden="true" className="size-5 text-nbc-royal" />
              My reservations
            </h2>
            {reservations.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                You have no reservations yet. Once you book, they will appear here automatically.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {reservations.map((reservation) => (
                  <li
                    key={reservation.reference}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {reservation.hotelName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.reference} ·{" "}
                        {new Date(reservation.checkIn).toLocaleDateString("en-GB")} –{" "}
                        {new Date(reservation.checkOut).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {reservation.currency} {reservation.totalAmount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="ghost" className="mt-4" asChild>
              <Link to="/hotels">Browse hotels</Link>
            </Button>
          </section>

          <aside className="grid gap-5">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ShieldCheck aria-hidden="true" className="size-5 text-nbc-royal" />
                Verification
              </h2>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                <li>Email {profile?.emailVerified ? "verified" : "not verified"}</li>
                <li>Phone {profile?.phoneVerified ? "verified" : "not verified"}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-nbc-gold/40 bg-nbc-gold/10 p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Sparkles aria-hidden="true" className="size-5 text-nbc-royal" />
                NBC account
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Linking your NBC bank account to your Hospitality profile is coming soon. You will
                be able to pay directly and redeem loyalty points at checkout.
              </p>
              <Button variant="scarlet" className="mt-4" disabled>
                Link NBC account · Coming soon
              </Button>
            </div>
          </aside>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
}
