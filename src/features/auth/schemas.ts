import { z } from "zod";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be under 72 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  organizationName: z.string().trim().min(1, "Organization name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordField,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
