import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { demoProfile, type NbcCustomerProfile } from "@/lib/nbc-profile";
import type { PaymentMethodId, PaymentOutcome } from "@/lib/nbc-payments";
import type { RoomCategory, RoomSelectionSearch, SelectionTotals } from "@/lib/nbc-room-selection";

/**
 * Booking session (draft reservation).
 *
 * This is deliberately modelled as a reservation session rather than as
 * transient form state: it carries an identity, a hold window and a lifecycle
 * status. When backend reservation locking is introduced the same interface is
 * backed by server functions and no presentation component changes.
 */

export type BookingSessionStatus = "idle" | "draft" | "pending_payment" | "confirmed" | "expired";

export interface BookingRoomLine {
  roomId: string;
  roomName: string;
  quantity: number;
  /** Rate snapshot taken at selection time, as a real inventory hold would. */
  nightlyRate: number;
  subtotal: number;
}

export interface BookingPricing {
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface ReservationOwner {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: "en" | "sw";
  arrivalTime: string;
  specialRequests: string;
}

export interface BookingSession {
  sessionId: string;
  createdAt: string;
  /** Hold window for the selected rooms. */
  expiresAt: string;
  status: BookingSessionStatus;
  propertyId: string;
  propertyName: string;
  stay: RoomSelectionSearch;
  nights: number;
  roomLines: BookingRoomLine[];
  pricing: BookingPricing;
  owner?: ReservationOwner;
  paymentMethodId?: PaymentMethodId;
  paymentOutcome?: PaymentOutcome;
}

export interface StartSessionInput {
  propertyId: string;
  propertyName: string;
  stay: RoomSelectionSearch;
  nights: number;
  totals: SelectionTotals;
  currency: string;
}

interface BookingFlowValue {
  session?: BookingSession;
  profile: NbcCustomerProfile;
  nbcAccountLinked: boolean;
  /** Simulates linking an NBC account to the Hospitality profile. */
  linkNbcAccount: () => void;
  startSession: (input: StartSessionInput) => BookingSession;
  updateOwner: (owner: ReservationOwner) => void;
  selectPayment: (methodId: PaymentMethodId) => void;
  confirmSession: (outcome: PaymentOutcome) => void;
  releaseSession: () => void;
  /** Placeholder for the future confirmation-email server call. */
  resendConfirmationEmail: () => Promise<void>;
}

const BookingFlowContext = createContext<BookingFlowValue | undefined>(undefined);

/** Rooms are held for 20 minutes while the guest completes the flow. */
const HOLD_MINUTES = 20;

function newSessionId(): string {
  return `bkg_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function toRoomLines(totals: SelectionTotals): BookingRoomLine[] {
  return totals.lines.map((line) => ({
    roomId: line.room.id,
    roomName: line.room.name,
    quantity: line.quantity,
    nightlyRate: line.room.nightlyRate,
    subtotal: line.subtotal,
  }));
}

export function roomLinesFromCategories(
  categories: RoomCategory[],
  selection: Record<string, number>,
): BookingRoomLine[] {
  return categories
    .filter((room) => (selection[room.id] ?? 0) > 0)
    .map((room) => ({
      roomId: room.id,
      roomName: room.name,
      quantity: selection[room.id],
      nightlyRate: room.nightlyRate,
      subtotal: 0,
    }));
}

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<BookingSession | undefined>(undefined);
  const [nbcAccountLinked, setNbcAccountLinked] = useState(demoProfile.nbcAccountLinked);

  const startSession = useCallback((input: StartSessionInput) => {
    const now = new Date();
    const expires = new Date(now.getTime() + HOLD_MINUTES * 60_000);
    const next: BookingSession = {
      sessionId: newSessionId(),
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: "draft",
      propertyId: input.propertyId,
      propertyName: input.propertyName,
      stay: input.stay,
      nights: input.nights,
      roomLines: toRoomLines(input.totals),
      pricing: {
        subtotal: input.totals.subtotal,
        taxes: input.totals.taxes,
        total: input.totals.total,
        currency: input.currency,
      },
    };
    setSession(next);
    return next;
  }, []);

  const updateOwner = useCallback((owner: ReservationOwner) => {
    setSession((prev) => (prev ? { ...prev, owner } : prev));
  }, []);

  const selectPayment = useCallback((paymentMethodId: PaymentMethodId) => {
    setSession((prev) =>
      prev ? { ...prev, paymentMethodId, status: "pending_payment" } : prev,
    );
  }, []);

  const confirmSession = useCallback((paymentOutcome: PaymentOutcome) => {
    setSession((prev) =>
      prev ? { ...prev, paymentOutcome, status: "confirmed" } : prev,
    );
  }, []);

  const releaseSession = useCallback(() => {
    setSession(undefined);
  }, []);

  const linkNbcAccount = useCallback(() => {
    setNbcAccountLinked(true);
  }, []);

  const resendConfirmationEmail = useCallback(async () => {
    // Placeholder for the future server call.
    await new Promise((resolve) => setTimeout(resolve, 600));
  }, []);

  const value = useMemo<BookingFlowValue>(
    () => ({
      session,
      profile: demoProfile,
      nbcAccountLinked,
      linkNbcAccount,
      startSession,
      updateOwner,
      selectPayment,
      confirmSession,
      releaseSession,
      resendConfirmationEmail,
    }),
    [
      session,
      nbcAccountLinked,
      linkNbcAccount,
      startSession,
      updateOwner,
      selectPayment,
      confirmSession,
      releaseSession,
      resendConfirmationEmail,
    ],
  );

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow(): BookingFlowValue {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error("useBookingFlow must be used within a BookingFlowProvider");
  }
  return context;
}
