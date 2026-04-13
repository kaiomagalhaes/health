import { z } from "zod";

export const personSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type PersonInput = z.infer<typeof personSchema>;
