/**
 * Demo profile & settings data for the customer account module.
 * Mirrors the future settings API contract — swapping in live data will not
 * change the presentation components.
 */

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
}

export interface CommunicationPreferences {
  reservationUpdates: boolean;
  paymentNotifications: boolean;
  rewardsLoyalty: boolean;
  promotions: boolean;
  email: boolean;
  sms: boolean;
}

export interface TravelPreferences {
  bedType: string;
  smoking: string;
  highFloor: boolean;
  accessibility: string;
  dietary: string;
}

export interface RegionPreferences {
  language: string;
  currency: string;
  timeZone: string;
}

export const demoPersonalInformation: PersonalInformation = {
  firstName: "Amina",
  lastName: "Mrisho",
  email: "amina.mrisho@example.co.tz",
  phone: "+255 754 210 884",
  dateOfBirth: "1992-04-18",
  nationality: "Tanzanian",
};

export const demoCommunicationPreferences: CommunicationPreferences = {
  reservationUpdates: true,
  paymentNotifications: true,
  rewardsLoyalty: true,
  promotions: false,
  email: true,
  sms: false,
};

export const demoTravelPreferences: TravelPreferences = {
  bedType: "King",
  smoking: "Non-Smoking",
  highFloor: true,
  accessibility: "None",
  dietary: "Halal",
};

export const demoRegionPreferences: RegionPreferences = {
  language: "English",
  currency: "TZS",
  timeZone: "Africa/Dar_es_Salaam",
};

export const bedTypeOptions = ["King", "Queen", "Twin", "Double", "No preference"] as const;
export const smokingOptions = ["Non-Smoking", "Smoking"] as const;
export const accessibilityOptions = [
  "None",
  "Step-free access",
  "Accessible bathroom",
  "Visual assistance",
  "Hearing assistance",
] as const;
export const dietaryOptions = [
  "None",
  "Halal",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Nut allergy",
] as const;
export const languageOptions = ["English", "Kiswahili"] as const;
export const currencyOptions = ["TZS", "USD", "EUR"] as const;
export const timeZoneOptions = [
  "Africa/Dar_es_Salaam",
  "Africa/Nairobi",
  "Europe/London",
  "Asia/Dubai",
] as const;

export const memberSince = "March 2024";

/** Profile completion is derived from the fields the guest has filled in. */
export function profileCompletion(info: PersonalInformation): number {
  const fields = [
    info.firstName,
    info.lastName,
    info.email,
    info.phone,
    info.dateOfBirth,
    info.nationality,
  ];
  const filled = fields.filter((value) => value.trim().length > 0).length;
  // Personal details carry 85% of the score; the remainder unlocks with
  // identity documents and saved travel companions in a later release.
  return Math.round((filled / fields.length) * 85);
}

export function formatDateOfBirth(iso: string): string {
  if (!iso) return "Not provided";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
