import { createFileRoute, useParams } from "@tanstack/react-router";

import { AdminCard, AdminLink, HotelAdminLayout } from "@/components/nbc/HotelAdminLayout";
import { Button } from "@/components/ui/button";
import { hotelProperty } from "@/lib/nbc-hotel-admin";

export const Route = createFileRoute("/hotel/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hotel operations · NBC Hospitality" },
      {
        name: "description",
        content:
          "Hotel operations module for NBC Hospitality property partners — reservations, rooms, guests, services and finance.",
      },
      { property: "og:title", content: "Hotel operations · NBC Hospitality" },
      {
        property: "og:description",
        content: "Property operations workspace for NBC Hospitality hotel partners.",
      },
    ],
  }),
  component: HotelModulePlaceholder,
});

function titleFor(splat: string): string {
  const segments = splat.split("/").filter(Boolean);
  if (segments.length === 0) return "Hotel operations";
  return segments
    .map((segment) =>
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" · ");
}

function HotelModulePlaceholder() {
  const params = useParams({ from: "/hotel/$" });
  const splat = params._splat ?? "";

  return (
    <HotelAdminLayout propertyName={hotelProperty.name}>
      <header>
        <p className="nbc-eyebrow text-[0.625rem] text-nbc-scarlet">Hotel operations</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {titleFor(splat)}
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          This module is part of the hotel operations roadmap. The navigation and access model are
          in place — detailed management screens arrive in the next phase.
        </p>
      </header>
      <AdminCard className="mt-6">
        <div className="grid gap-3 rounded-xl border border-dashed border-border/70 bg-secondary/30 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">Coming in the next phase</p>
          <p className="mx-auto max-w-prose text-sm leading-relaxed text-muted-foreground">
            Your dashboard already surfaces the operational signals from this module, so nothing is
            missed while it is being built.
          </p>
          <div className="mt-1 flex justify-center">
            <Button variant="outline" asChild>
              <AdminLink to="/hotel/dashboard">Back to dashboard</AdminLink>
            </Button>
          </div>
        </div>
      </AdminCard>
    </HotelAdminLayout>
  );
}
