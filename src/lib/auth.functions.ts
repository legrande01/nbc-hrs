import { createServerFn } from "@tanstack/react-start";

import {
  consumeOtp,
  createAccount,
  getVerificationTargets,
  issueOtp,
  markVerified,
  normalisePhone,
  resolveAccountEmail,
  setPasswordForEmail,
} from "@/lib/auth.server";

/**
 * Identity server functions. Verification state is decided here and never
 * trusted from the browser.
 */

export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await createAccount({ ...data, accountType: "customer" });

    const emailOtp = await issueOtp({
      identifier: data.email,
      channel: "email",
      purpose: "signup",
    });
    const phoneOtp = await issueOtp({
      identifier: data.phone,
      channel: "phone",
      purpose: "signup",
    });

    return {
      email: data.email.trim().toLowerCase(),
      phone: normalisePhone(data.phone),
      demoEmailCode: emailOtp.code,
      demoPhoneCode: phoneOtp.code,
    };
  });

export const resendSignupOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; channel: "email" | "phone" }) => data)
  .handler(async ({ data }) => {
    const targets = await getVerificationTargets(data.email);
    if (!targets) throw new Error("No account matches that email address.");
    const identifier = data.channel === "email" ? targets.email : targets.phone;
    const { code } = await issueOtp({ identifier, channel: data.channel, purpose: "signup" });
    return { demoCode: code };
  });

export const verifySignupOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; channel: "email" | "phone"; code: string }) => data)
  .handler(async ({ data }) => {
    const targets = await getVerificationTargets(data.email);
    if (!targets) throw new Error("No account matches that email address.");
    const identifier = data.channel === "email" ? targets.email : targets.phone;

    const ok = await consumeOtp({
      identifier,
      channel: data.channel,
      purpose: "signup",
      code: data.code,
    });
    if (!ok) return { verified: false, emailVerified: targets.emailVerified, phoneVerified: targets.phoneVerified };

    const state = await markVerified({ email: data.email, channel: data.channel });
    return { verified: true, ...state };
  });

export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => ({ email: await resolveAccountEmail(data.identifier) }));

export const requestPasswordResetOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const email = await resolveAccountEmail(data.identifier);
    if (!email) {
      // Do not disclose whether the account exists.
      return { sent: true, email: null, demoCode: null };
    }
    const targets = await getVerificationTargets(email);
    const useEmail = !targets?.phone || data.identifier.includes("@");
    const { code } = await issueOtp({
      identifier: useEmail ? email : targets.phone,
      channel: useEmail ? "email" : "phone",
      purpose: "password_reset",
    });
    return { sent: true, email, demoCode: code, channel: useEmail ? "email" : "phone" };
  });

export const resetPasswordWithOtp = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; code: string; password: string }) => data)
  .handler(async ({ data }) => {
    const targets = await getVerificationTargets(data.email);
    if (!targets) throw new Error("No account matches those details.");

    const viaEmail = await consumeOtp({
      identifier: targets.email,
      channel: "email",
      purpose: "password_reset",
      code: data.code,
    });
    const viaPhone = viaEmail
      ? false
      : await consumeOtp({
          identifier: targets.phone,
          channel: "phone",
          purpose: "password_reset",
          code: data.code,
        });

    if (!viaEmail && !viaPhone) return { reset: false };

    await setPasswordForEmail(targets.email, data.password);
    return { reset: true, email: targets.email };
  });
