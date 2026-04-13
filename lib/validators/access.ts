import { z } from "zod";

export const accessSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  appointmentId: z.string().optional(),
  websiteUrl: z.string().min(1, "Website URL is required"),
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
  description: z.string().optional(),
});

export type AccessInput = z.infer<typeof accessSchema>;
