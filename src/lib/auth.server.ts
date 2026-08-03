/**
 * Server-only identity helpers shared by the customer and hotel partner
 * authentication flows. Both audiences use the same underlying auth service;
 * only their entry points and screens differ.
 */

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export type OtpChannel = "email" | "phone";
export type OtpPurpose = "signup" | "password_reset";

/** Normalises a phone number so lookups are stable (digits and leading +). */
export function normalisePhone(value: string): string {
  const trimmed = value.trim().replace(/[^\d+]/g, "");
  if (!trimmed) return "";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/^0+/, "255")}`;
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes("@");
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtpCode(code: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateReference(prefix: string): string {
  let digits = "";
  for (let index = 0; index < 8; index += 1) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}-${digits.slice(0, 4)}-${digits.slice(4)}`;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Issues a one-time code for the given identifier.
 *
 * Delivery is simulated for now — the code is returned to the caller so the
 * flow is complete end to end. Swapping in real email/SMS delivery only means
 * sending `code` instead of returning it.
 */
export async function issueOtp(input: {
  identifier: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  userId?: string | null;
}): Promise<{ code: string; expiresAt: string }> {
  const db = await admin();
  const code = generateOtpCode();
  const identifier = input.channel === "phone" ? normalisePhone(input.identifier) : input.identifier.trim().toLowerCase();
  const codeHash = await hashOtpCode(code, identifier);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

  await db
    .from("otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("identifier", identifier)
    .eq("channel", input.channel)
    .eq("purpose", input.purpose)
    .is("consumed_at", null);

  const { error } = await db.from("otp_codes").insert({
    identifier,
    channel: input.channel,
    purpose: input.purpose,
    code_hash: codeHash,
    expires_at: expiresAt,
    user_id: input.userId ?? null,
  });
  if (error) throw new Error(error.message);

  return { code, expiresAt };
}

/** Consumes a one-time code. Returns false for wrong, expired or used codes. */
export async function consumeOtp(input: {
  identifier: string;
  channel: OtpChannel;
  purpose: OtpPurpose;
  code: string;
}): Promise<boolean> {
  const db = await admin();
  const identifier =
    input.channel === "phone" ? normalisePhone(input.identifier) : input.identifier.trim().toLowerCase();

  const { data: rows } = await db
    .from("otp_codes")
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("identifier", identifier)
    .eq("channel", input.channel)
    .eq("purpose", input.purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const record = rows?.[0];
  if (!record) return false;
  if (new Date(record.expires_at).getTime() < Date.now()) return false;
  if (record.attempts >= MAX_ATTEMPTS) return false;

  const expected = await hashOtpCode(input.code.trim(), identifier);
  if (expected !== record.code_hash) {
    await db
      .from("otp_codes")
      .update({ attempts: record.attempts + 1 })
      .eq("id", record.id);
    return false;
  }

  await db.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", record.id);
  return true;
}

/** Resolves an email address from either an email or a registered phone. */
export async function resolveAccountEmail(identifier: string): Promise<string | null> {
  const value = identifier.trim();
  if (!value) return null;
  if (isEmailIdentifier(value)) return value.toLowerCase();

  const db = await admin();
  const { data } = await db
    .from("profiles")
    .select("email")
    .eq("phone", normalisePhone(value))
    .maybeSingle();

  return data?.email ?? null;
}

export interface CreateAccountInput {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  accountType: "customer" | "hotel_admin";
}

/** Creates an auth user with a pre-confirmed email; verification is ours. */
export async function createAccount(input: CreateAccountInput): Promise<{ userId: string }> {
  const db = await admin();
  const phone = normalisePhone(input.phone);

  const { data, error } = await db.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone,
      account_type: input.accountType,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Could not create the account.");
  }

  await db
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email.trim().toLowerCase(),
      phone,
    })
    .eq("id", data.user.id);

  return { userId: data.user.id };
}

export async function markVerified(input: {
  email: string;
  channel: OtpChannel;
}): Promise<{ emailVerified: boolean; phoneVerified: boolean }> {
  const db = await admin();
  const email = input.email.trim().toLowerCase();
  const patch = input.channel === "email" ? { email_verified: true } : { phone_verified: true };

  const { data, error } = await db
    .from("profiles")
    .update(patch)
    .eq("email", email)
    .select("email_verified, phone_verified")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return {
    emailVerified: Boolean(data?.email_verified),
    phoneVerified: Boolean(data?.phone_verified),
  };
}

export async function setPasswordForEmail(email: string, password: string): Promise<void> {
  const db = await admin();
  const { data } = await db.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (!data?.id) throw new Error("No account matches those details.");
  const { error } = await db.auth.admin.updateUserById(data.id, { password });
  if (error) throw new Error(error.message);
}

export async function getVerificationTargets(
  email: string,
): Promise<{ email: string; phone: string; emailVerified: boolean; phoneVerified: boolean } | null> {
  const db = await admin();
  const { data } = await db
    .from("profiles")
    .select("email, phone, email_verified, phone_verified")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (!data) return null;
  return {
    email: data.email,
    phone: data.phone,
    emailVerified: data.email_verified,
    phoneVerified: data.phone_verified,
  };
}
