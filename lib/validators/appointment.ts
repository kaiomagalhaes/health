import { z } from "zod";

export const appointmentSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  dateTime: z.string().min(1, "Date and time are required"),
  durationMinutes: z.number().min(1),
  type: z.enum(["consultation", "follow_up", "exam", "emergency", "other"]),
  location: z.string().optional(),
  doctorName: z.string().optional(),
  specialty: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
