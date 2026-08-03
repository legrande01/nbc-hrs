/**
 * Demo customer profile.
 *
 * Placeholder for the authenticated NBC Hospitality profile. Shapes mirror the
 * future profile API so presentation components stay unchanged when real
 * authentication is introduced — `nbcAccountLinked` will simply come from the
 * signed-in user instead of this module.
 */

export interface NbcCustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  preferredLanguage: "en" | "sw";
  /** Whether an NBC bank account is linked to the Hospitality profile. */
  nbcAccountLinked: boolean;
  loyaltyPoints: number;
  /** Value of one loyalty point, in the platform currency. */
  loyaltyPointValue: number;
  maskedAccount: string;
}

/**
 * The guest starts without a linked NBC account so the discovery journey
 * ("Link NBC Account") is visible. Linking during checkout flips the session
 * into the eligible journey — no artificial UI toggle required.
 */
export const demoProfile: NbcCustomerProfile = {
  id: "demo-guest",
  fullName: "",
  email: "",
  phone: "",
  country: "Tanzania",
  preferredLanguage: "en",
  nbcAccountLinked: false,
  loyaltyPoints: 184_500,
  loyaltyPointValue: 1,
  maskedAccount: "•••• 4821",
};

export function getDemoProfile(): NbcCustomerProfile {
  return demoProfile;
}
