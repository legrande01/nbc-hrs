import { useMemo, useState } from "react";
import { CalendarClock, Clock, Plus, Users } from "lucide-react";

import {
  ServiceAvailabilityBadge,
  ServiceStatusBadge,
} from "@/components/nbc/ReservationBadges";
import { AccountEmptyState } from "@/components/nbc/AccountLayout";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDate,
  formatMoney,
  serviceCategories,
  servicesForCategory,
  type AddedService,
  type HotelService,
  type ServiceCategoryKey,
} from "@/lib/nbc-reservations";

interface HotelServicesSectionProps {
  addedServices: AddedService[];
  onAddService: (service: HotelService, details: ServiceBookingDetails) => void;
}

export interface ServiceBookingDetails {
  date: string;
  time: string;
  passengers: number;
  flightNumber: string;
  quantity: number;
  notes: string;
}

const emptyDetails: ServiceBookingDetails = {
  date: "",
  time: "",
  passengers: 1,
  flightNumber: "",
  quantity: 1,
  notes: "",
};

/** Catalogue of hotel services plus the guest's added services. */
export function HotelServicesSection({
  addedServices,
  onAddService,
}: HotelServicesSectionProps) {
  const [active, setActive] = useState<ServiceCategoryKey>("dining");
  const [selected, setSelected] = useState<HotelService | null>(null);

  return (
    <div className="grid gap-6">
      <Tabs value={active} onValueChange={(value) => setActive(value as ServiceCategoryKey)}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.key} value={category.key} className="gap-2">
                <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {serviceCategories.map((category) => (
          <TabsContent key={category.key} value={category.key} className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {servicesForCategory(category.key).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={() => setSelected(service)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid gap-4 border-t border-border pt-6">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">My Added Services</h3>
        {addedServices.length === 0 ? (
          <AccountEmptyState
            title="No services added yet"
            description="Add dining, transfers or an experience above and the hotel will take care of the rest."
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {addedServices.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-xl border border-border/70 bg-secondary/20 p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="size-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <ServiceStatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                      {item.date ? formatDate(item.date) : "Date to confirm"}
                    </span>
                    {item.time ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
                        {item.time}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">
                    {formatMoney(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ServiceBookingModal
        service={selected}
        onClose={() => setSelected(null)}
        onConfirm={(service, details) => {
          onAddService(service, details);
          setSelected(null);
        }}
      />
    </div>
  );
}

function ServiceCard({ service, onBook }: { service: HotelService; onBook: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card">
      <div className="relative h-32">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          className="size-full object-cover"
        />
        <ServiceAvailabilityBadge
          availability={service.availability}
          className="absolute right-3 top-3 shadow-sm"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-foreground">{service.name}</h4>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {formatMoney(service.price)}
            </p>
            <p className="truncate text-xs text-muted-foreground">{service.priceUnit}</p>
          </div>
          <Button size="sm" onClick={onBook}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
            Book Service
          </Button>
        </div>
      </div>
    </article>
  );
}

function ServiceBookingModal({
  service,
  onClose,
  onConfirm,
}: {
  service: HotelService | null;
  onClose: () => void;
  onConfirm: (service: HotelService, details: ServiceBookingDetails) => void;
}) {
  const [details, setDetails] = useState<ServiceBookingDetails>(emptyDetails);
  const inputs = useMemo(() => new Set(service?.inputs ?? []), [service]);

  const patch = (next: Partial<ServiceBookingDetails>) =>
    setDetails((current) => ({ ...current, ...next }));

  return (
    <Dialog
      open={Boolean(service)}
      onOpenChange={(open) => {
        if (!open) {
          setDetails(emptyDetails);
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {service ? (
          <>
            <DialogHeader>
              <DialogTitle>{service.name}</DialogTitle>
              <DialogDescription>{service.description}</DialogDescription>
            </DialogHeader>

            <img
              src={service.image}
              alt={service.name}
              className="h-52 w-full rounded-xl object-cover"
            />

            <div className="grid gap-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {service.longDescription}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="nbc-eyebrow text-[0.625rem] text-muted-foreground">What's included</p>
                  <ul className="mt-2 grid gap-1.5 text-sm text-foreground">
                    {service.includes.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="text-nbc-royal">
                          •
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <dl className="grid content-start gap-3 rounded-xl border border-border/70 bg-secondary/30 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium text-foreground">{service.duration}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="font-semibold text-foreground">
                      {formatMoney(service.price)}{" "}
                      <span className="font-normal text-muted-foreground">
                        {service.priceUnit}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Availability</dt>
                    <dd>
                      <ServiceAvailabilityBadge availability={service.availability} />
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {inputs.has("date") ? (
                  <div className="grid gap-2">
                    <Label htmlFor="service-date">Date</Label>
                    <Input
                      id="service-date"
                      type="date"
                      value={details.date}
                      onChange={(event) => patch({ date: event.target.value })}
                    />
                  </div>
                ) : null}
                {inputs.has("time") ? (
                  <div className="grid gap-2">
                    <Label htmlFor="service-time">Time</Label>
                    <Input
                      id="service-time"
                      type="time"
                      value={details.time}
                      onChange={(event) => patch({ time: event.target.value })}
                    />
                  </div>
                ) : null}
                {inputs.has("passengers") ? (
                  <div className="grid gap-2">
                    <Label htmlFor="service-passengers">Passengers</Label>
                    <Input
                      id="service-passengers"
                      type="number"
                      min={1}
                      value={details.passengers}
                      onChange={(event) => patch({ passengers: Number(event.target.value) })}
                    />
                  </div>
                ) : null}
                {inputs.has("flightNumber") ? (
                  <div className="grid gap-2">
                    <Label htmlFor="service-flight">Flight number</Label>
                    <Input
                      id="service-flight"
                      placeholder="e.g. KL569"
                      value={details.flightNumber}
                      onChange={(event) => patch({ flightNumber: event.target.value })}
                    />
                  </div>
                ) : null}
                {inputs.has("quantity") ? (
                  <div className="grid gap-2">
                    <Label htmlFor="service-quantity">Quantity</Label>
                    <Input
                      id="service-quantity"
                      type="number"
                      min={1}
                      value={details.quantity}
                      onChange={(event) => patch({ quantity: Number(event.target.value) })}
                    />
                  </div>
                ) : null}
                {inputs.has("notes") ? (
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="service-notes">Notes for the hotel</Label>
                    <Textarea
                      id="service-notes"
                      rows={3}
                      placeholder="Anything the team should know?"
                      value={details.notes}
                      onChange={(event) => patch({ notes: event.target.value })}
                    />
                  </div>
                ) : null}
              </div>

              <p className="rounded-xl bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
                {service.terms}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onConfirm(service, details)}>
                <Users aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Add to Reservation
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
