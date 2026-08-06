import { useState } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Mail,
  MessageCircle,
  Phone,
  Receipt,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { AccountCard, AccountEmptyState, AccountLayout } from "@/components/nbc/AccountLayout";
import {
  HotelServicesSection,
  type ServiceBookingDetails,
} from "@/components/nbc/HotelServicesSection";
import { SpecialRequestBadge } from "@/components/nbc/ReservationBadges";
import { ReservationTimeline } from "@/components/nbc/ReservationTimeline";
import { StaySummary } from "@/components/nbc/StaySummary";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import {
  findReservationByReference,
  nightsBetween,
  type AddedService,
  type HotelService,
  type Reservation,
} from "@/lib/nbc-reservations";


export const Route = createFileRoute("/account/reservations/$reference")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user)
      throw redirect({
        to: "/account/login",
        search: { next: `/account/reservations/${params.reference}` },
      });
  },
  loader: ({ params }) => {
    const reservation = findReservationByReference(params.reference);
    if (!reservation) throw notFound();
    return { reservation };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Reservation unavailable · NBC Hospitality" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { reservation } = loaderData;
    const title = `${reservation.hotelName} · ${reservation.reference} · NBC Hospitality`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Manage your stay at ${reservation.hotelName} in ${reservation.destination}: stay details, services, payments and hotel contacts.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Reservation ${reservation.reference} at ${reservation.hotelName}.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  notFoundComponent: () => (
    <AccountLayout>
      <AccountCard>
        <AccountEmptyState
          title="Reservation not found"
          description="We could not find that booking reference on your account."
          action={
            <Button asChild variant="outline">
              <Link to="/account/reservations">Back to my reservations</Link>
            </Button>
          }
        />
      </AccountCard>
    </AccountLayout>
  ),
  component: ReservationDetailsPage,
});

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <AccountCard>
      <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </AccountCard>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ReservationDetailsPage() {
  const { reservation } = Route.useLoaderData() as { reservation: Reservation };
  const [addedServices, setAddedServices] = useState<AddedService[]>(reservation.addedServices);

  const balance = Math.max(0, reservation.total - reservation.amountPaid);
  const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
  const cancellable = reservation.status === "upcoming" || reservation.status === "pending-payment";

  const handleAddService = (service: HotelService, details: ServiceBookingDetails) => {
    const quantity = service.inputs.includes("quantity") ? Math.max(1, details.quantity) : 1;
    setAddedServices((current) => [
      ...current,
      {
        id: `${service.id}-${Date.now()}`,
        serviceId: service.id,
        name: service.name,
        image: service.image,
        date: details.date,
        time: details.time,
        price: service.price * quantity,
        status: "requested",
      },
    ]);
    toast.success(`${service.name} requested`, {
      description: "The hotel will confirm your request shortly.",
    });
  };

  const demo = (message: string) => () =>
    toast.info(message, { description: "Demo experience — no document is generated yet." });

  return (
    <AccountLayout>
      <header>
        <Link
          to="/account/reservations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.75} />
          My reservations
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {reservation.hotelName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {reservation.reference} · {reservation.destination} · {nights} night
          {nights === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mt-8 grid gap-6">
        {/* 1. Stay summary */}
        <StaySummary
          reservation={reservation}
          onDownloadConfirmation={demo("Confirmation download started")}
          onDownloadReceipt={demo("Receipt download started")}
        />

        {/* 2. Reservation journey */}
        <SectionCard title="Reservation journey">
          <ReservationTimeline reservation={reservation} />
        </SectionCard>


        {/* 5. Hotel services & experiences */}
        <SectionCard
          title="Hotel Services & Experiences"
          description="Enhance your stay with exclusive services offered by your hotel."
        >
          <HotelServicesSection addedServices={addedServices} onAddService={handleAddService} />
        </SectionCard>

        {/* 6. Special requests */}
        <SectionCard
          title="Special requests"
          description="Complimentary requests handled by the hotel team, separate from paid services."
        >
          {reservation.specialRequests.length === 0 ? (
            <AccountEmptyState
              title="No special requests"
              description="Let the hotel know about extra pillows, a baby cot, accessibility needs or a late arrival and it will appear here."
            />
          ) : (
            <ul className="grid gap-3">
              {reservation.specialRequests.map((request) => (
                <li
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-secondary/20 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{request.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{request.detail}</p>
                  </div>
                  <SpecialRequestBadge status={request.status} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* 7. Hotel policies */}
        <SectionCard title="Hotel policies">
          <Accordion type="single" collapsible className="w-full">
            {reservation.policies.map((policy) => (
              <AccordionItem key={policy.title} value={policy.title}>
                <AccordionTrigger className="text-left text-sm font-semibold">
                  {policy.title}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {policy.body}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SectionCard>

        {/* 8. Contact hotel */}
        <SectionCard title="Contact hotel">
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Reception" value={reservation.contact.reception} />
            <Detail label="Reservations desk" value={reservation.contact.reservationsDesk} />
            <Detail label="Email" value={reservation.contact.email} />
            {reservation.contact.whatsapp ? (
              <Detail label="WhatsApp" value={reservation.contact.whatsapp} />
            ) : null}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href={`tel:${reservation.contact.reception}`}>
                <Phone aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Call Hotel
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`mailto:${reservation.contact.email}`}>
                <Mail aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Email Hotel
              </a>
            </Button>
            {reservation.contact.whatsapp ? (
              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/${reservation.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </SectionCard>

        {/* 9. Reservation actions */}
        <SectionCard title="Reservation actions">
          <div className="flex flex-wrap gap-3">
            {reservation.status !== "cancelled" ? (
              <Button variant="outline" onClick={demo("Confirmation download started")}>
                <Download aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Download Confirmation
              </Button>
            ) : null}
            {reservation.amountPaid > 0 ? (
              <Button variant="outline" onClick={demo("Receipt download started")}>
                <Receipt aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Download Receipt
              </Button>
            ) : null}
            <Button asChild>
              <Link to="/hotels">Book Another Stay</Link>
            </Button>
            {cancellable ? (
              <Button
                variant="ghost"
                className="text-nbc-scarlet hover:text-nbc-scarlet"
                onClick={demo("Cancellation requests open soon")}
              >
                <XCircle aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Cancel Reservation
              </Button>
            ) : null}
            {reservation.status === "completed" ? (
              <Button variant="outline" onClick={demo("Reviews are coming soon")}>
                <Star aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Leave Review
              </Button>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </AccountLayout>
  );
}
