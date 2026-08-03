import { z } from "zod";

/** Shared validation for customer and hotel partner identity forms. */

export const phoneSchema = z
  .string()
  .trim()
  .min(9, "Enter a valid phone number")
  .max(20, "Enter a valid phone number")
  .regex(/^[0-9+()\-\s]+$/, "Enter a valid phone number");

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(255, "Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use fewer than 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const customerRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter your first name").max(60),
    lastName: z.string().trim().min(2, "Enter your last name").max(60),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type CustomerRegistrationValues = z.infer<typeof customerRegistrationSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or phone number").max(255),
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
});

export const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export const businessInfoSchema = z.object({
  hotelName: z.string().trim().min(2, "Enter the hotel name").max(120),
  tin: z.string().trim().min(6, "Enter a valid TIN").max(30),
  businessRegistrationNumber: z.string().trim().max(60).optional().or(z.literal("")),
  businessEmail: emailSchema,
  businessPhone: phoneSchema,
});

export const propertyInfoSchema = z.object({
  propertyType: z.string().trim().min(2, "Select a property type"),
  starRating: z.coerce.number().int().min(1).max(5),
  roomCount: z.coerce.number().int().min(1, "Enter the number of rooms").max(5000),
  country: z.string().trim().min(2, "Enter the country").max(60),
  region: z.string().trim().min(2, "Enter the region").max(60),
  district: z.string().trim().min(2, "Enter the district").max(60),
  physicalAddress: z.string().trim().min(5, "Enter the physical address").max(240),
});

export const adminAccountSchema = z
  .object({
    adminFullName: z.string().trim().min(3, "Enter the administrator name").max(120),
    adminEmail: emailSchema,
    adminPhone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const findReservationSchema = z.object({
  reference: z.string().trim().min(4, "Enter your booking reference").max(40),
  contact: z.string().trim().min(4, "Enter the email or phone used to book").max(255),
});

export const propertyTypeOptions = [
  "Hotel",
  "Resort",
  "Serviced Apartment",
  "Lodge",
  "Boutique Hotel",
  "Guest House",
] as const;
