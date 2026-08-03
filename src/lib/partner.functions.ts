import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getApplicationForUser,
  submitApplication,
  updateApplicationForUser,
  type PartnerApplicationInput,
} from "@/lib/partner.server";

export const submitPartnerApplication = createServerFn({ method: "POST" })
  .inputValidator((data: PartnerApplicationInput) => data)
  .handler(async ({ data }) => submitApplication(data));

export const getMyPartnerApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => ({
    application: await getApplicationForUser(context.userId),
  }));

export const updateMyPartnerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: Partial<PartnerApplicationInput> & {
      licenseDocumentPath?: string;
      tinDocumentPath?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    await updateApplicationForUser(context.userId, data);
    return { application: await getApplicationForUser(context.userId) };
  });
