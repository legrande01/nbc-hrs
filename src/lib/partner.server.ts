import { generateReference, createAccount, normalisePhone } from "@/lib/auth.server";

/** Server-only hotel partner application storage. */

export interface PartnerApplicationInput {
  hotelName: string;
  tin: string;
  businessRegistrationNumber?: string;
  businessEmail: string;
  businessPhone: string;
  propertyType: string;
  starRating: number;
  roomCount: number;
  country: string;
  region: string;
  district: string;
  physicalAddress: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  password: string;
}

export interface PartnerApplication {
  id: string;
  reference: string;
  hotelName: string;
  tin: string;
  businessRegistrationNumber: string | null;
  businessEmail: string;
  businessPhone: string;
  licenseDocumentPath: string | null;
  tinDocumentPath: string | null;
  propertyType: string;
  starRating: number | null;
  roomCount: number;
  country: string;
  region: string;
  district: string;
  physicalAddress: string;
  adminFullName: string;
  adminEmail: string;
  adminPhone: string;
  status: string;
  reviewNotes: string | null;
  submittedAt: string;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function toApplication(row: Record<string, unknown>): PartnerApplication {
  return {
    id: row.id as string,
    reference: row.reference as string,
    hotelName: row.hotel_name as string,
    tin: row.tin as string,
    businessRegistrationNumber: (row.business_registration_number as string | null) ?? null,
    businessEmail: row.business_email as string,
    businessPhone: row.business_phone as string,
    licenseDocumentPath: (row.license_document_path as string | null) ?? null,
    tinDocumentPath: (row.tin_document_path as string | null) ?? null,
    propertyType: row.property_type as string,
    starRating: (row.star_rating as number | null) ?? null,
    roomCount: row.room_count as number,
    country: row.country as string,
    region: row.region as string,
    district: row.district as string,
    physicalAddress: row.physical_address as string,
    adminFullName: row.admin_full_name as string,
    adminEmail: row.admin_email as string,
    adminPhone: row.admin_phone as string,
    status: row.status as string,
    reviewNotes: (row.review_notes as string | null) ?? null,
    submittedAt: row.submitted_at as string,
  };
}

export async function submitApplication(
  input: PartnerApplicationInput & { devBypass?: boolean },
): Promise<{ reference: string; email: string; approved: boolean }> {
  const [firstName, ...rest] = input.adminFullName.trim().split(/\s+/);
  const { userId } = await createAccount({
    email: input.adminEmail,
    password: input.password,
    phone: input.adminPhone,
    firstName: firstName ?? input.adminFullName,
    lastName: rest.join(" "),
    accountType: "hotel_admin",
  });

  const db = await admin();
  const reference = generateReference("NBC-HP");

  // Development/preview only: skip manual verification so hotel modules can be
  // built against a working partner account. Never true in production.
  const approved = input.devBypass === true && process.env["NODE_ENV"] !== "production";

  const { error } = await db.from("hotel_applications").insert({
    reference,
    admin_user_id: userId,
    hotel_name: input.hotelName,
    tin: input.tin,
    business_registration_number: input.businessRegistrationNumber || null,
    business_email: input.businessEmail.trim().toLowerCase(),
    business_phone: normalisePhone(input.businessPhone),
    property_type: input.propertyType,
    star_rating: input.starRating,
    room_count: input.roomCount,
    country: input.country,
    region: input.region,
    district: input.district,
    physical_address: input.physicalAddress,
    admin_full_name: input.adminFullName,
    admin_email: input.adminEmail.trim().toLowerCase(),
    admin_phone: normalisePhone(input.adminPhone),
    ...(approved ? { status: "approved" } : {}),
  });

  if (error) throw new Error(error.message);

  if (approved) {
    await db
      .from("profiles")
      .update({ email_verified: true, phone_verified: true })
      .eq("id", userId);
    await db
      .from("user_roles")
      .upsert({ user_id: userId, role: "hotel_admin" }, { onConflict: "user_id,role" });
  }

  return { reference, email: input.adminEmail.trim().toLowerCase(), approved };
}


export async function getApplicationForUser(userId: string): Promise<PartnerApplication | null> {
  const db = await admin();
  const { data } = await db
    .from("hotel_applications")
    .select("*")
    .eq("admin_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? toApplication(data as Record<string, unknown>) : null;
}

export async function updateApplicationForUser(
  userId: string,
  patch: Partial<PartnerApplicationInput> & {
    licenseDocumentPath?: string;
    tinDocumentPath?: string;
  },
): Promise<void> {
  const db = await admin();
  const update: Record<string, string | number | null> = {};
  if (patch.hotelName) update.hotel_name = patch.hotelName;
  if (patch.tin) update.tin = patch.tin;
  if (patch.businessRegistrationNumber !== undefined)
    update.business_registration_number = patch.businessRegistrationNumber || null;
  if (patch.businessEmail) update.business_email = patch.businessEmail.trim().toLowerCase();
  if (patch.businessPhone) update.business_phone = normalisePhone(patch.businessPhone);
  if (patch.propertyType) update.property_type = patch.propertyType;
  if (patch.starRating) update.star_rating = patch.starRating;
  if (patch.roomCount) update.room_count = patch.roomCount;
  if (patch.country) update.country = patch.country;
  if (patch.region) update.region = patch.region;
  if (patch.district) update.district = patch.district;
  if (patch.physicalAddress) update.physical_address = patch.physicalAddress;
  if (patch.licenseDocumentPath) update.license_document_path = patch.licenseDocumentPath;
  if (patch.tinDocumentPath) update.tin_document_path = patch.tinDocumentPath;

  if (Object.keys(update).length === 0) return;

  const { error } = await db
    .from("hotel_applications")
    .update(update as never)
    .eq("admin_user_id", userId);
  if (error) throw new Error(error.message);
}
