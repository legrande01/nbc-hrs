import {
  paymentStatusLabels,
  reservationStatusLabels,
  serviceAvailabilityLabels,
  type AddedServiceStatus,
  type PaymentStatus,
  type ReservationStatus,
  type ServiceAvailability,
  type SpecialRequestStatus,
} from "@/lib/nbc-reservations";
import { cn } from "@/lib/utils";

const base =
  "inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold";

const reservationStyles: Record<ReservationStatus, string> = {
  upcoming: "bg-nbc-royal/10 text-nbc-royal",
  "pending-payment": "bg-nbc-gold/20 text-foreground",
  "checked-in": "bg-nbc-emerald/10 text-nbc-emerald",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-nbc-scarlet/10 text-nbc-scarlet",
};

/** Status badge for a reservation. */
export function ReservationStatusBadge({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, reservationStyles[status], className)}>
      {reservationStatusLabels[status]}
    </span>
  );
}

const paymentStyles: Record<PaymentStatus, string> = {
  paid: "bg-nbc-emerald/10 text-nbc-emerald",
  "partially-paid": "bg-nbc-gold/20 text-foreground",
  unpaid: "bg-nbc-scarlet/10 text-nbc-scarlet",
  refunded: "bg-secondary text-muted-foreground",
};

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, paymentStyles[status], className)}>
      {paymentStatusLabels[status]}
    </span>
  );
}

const serviceStatusStyles: Record<AddedServiceStatus, string> = {
  requested: "bg-nbc-royal/10 text-nbc-royal",
  pending: "bg-nbc-gold/20 text-foreground",
  confirmed: "bg-nbc-emerald/10 text-nbc-emerald",
  completed: "bg-secondary text-muted-foreground",
  cancelled: "bg-nbc-scarlet/10 text-nbc-scarlet",
};

const serviceStatusLabels: Record<AddedServiceStatus, string> = {
  requested: "Requested",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ServiceStatusBadge({
  status,
  className,
}: {
  status: AddedServiceStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, serviceStatusStyles[status], className)}>
      {serviceStatusLabels[status]}
    </span>
  );
}

const requestStyles: Record<SpecialRequestStatus, string> = {
  pending: "bg-nbc-gold/20 text-foreground",
  approved: "bg-nbc-emerald/10 text-nbc-emerald",
  declined: "bg-nbc-scarlet/10 text-nbc-scarlet",
};

const requestLabels: Record<SpecialRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
};

export function SpecialRequestBadge({
  status,
  className,
}: {
  status: SpecialRequestStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, requestStyles[status], className)}>{requestLabels[status]}</span>
  );
}

const availabilityStyles: Record<ServiceAvailability, string> = {
  available: "bg-nbc-emerald/10 text-nbc-emerald",
  limited: "bg-nbc-gold/20 text-foreground",
  "on-request": "bg-secondary text-muted-foreground",
};

export function ServiceAvailabilityBadge({
  availability,
  className,
}: {
  availability: ServiceAvailability;
  className?: string;
}) {
  return (
    <span className={cn(base, availabilityStyles[availability], className)}>
      {serviceAvailabilityLabels[availability]}
    </span>
  );
}
