"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Appointment } from "@/models/Appointment";
import { Person } from "@/models/Person";
import {
  appointmentSchema,
  type AppointmentInput,
} from "@/lib/validators/appointment";
import type { AppointmentStatus, SerializedAppointment } from "@/types";

function serializeAppointment(a: Record<string, unknown>): SerializedAppointment {
  const person = a.personId as Record<string, unknown> | undefined;
  return {
    id: String(a._id),
    personId: person?._id ? String(person._id) : String(a.personId),
    person: person?._id
      ? {
          id: String(person._id),
          fullName: String(person.fullName),
          dateOfBirth: (person.dateOfBirth as Date).toISOString(),
          isActive: Boolean(person.isActive),
          createdAt: (person.createdAt as Date).toISOString(),
          updatedAt: (person.updatedAt as Date).toISOString(),
        }
      : undefined,
    dateTime: (a.dateTime as Date).toISOString(),
    durationMinutes: Number(a.durationMinutes),
    type: String(a.type) as SerializedAppointment["type"],
    status: String(a.status) as SerializedAppointment["status"],
    location: a.location ? String(a.location) : undefined,
    doctorName: a.doctorName ? String(a.doctorName) : undefined,
    specialty: a.specialty ? String(a.specialty) : undefined,
    notes: a.notes,
    isActive: Boolean(a.isActive),
    createdAt: (a.createdAt as Date).toISOString(),
    updatedAt: (a.updatedAt as Date).toISOString(),
  };
}

export async function createAppointment(data: AppointmentInput) {
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  const appointment = await Appointment.create({
    personId: parsed.data.personId,
    dateTime: new Date(parsed.data.dateTime),
    durationMinutes: parsed.data.durationMinutes,
    type: parsed.data.type,
    location: parsed.data.location,
    doctorName: parsed.data.doctorName,
    specialty: parsed.data.specialty,
  });

  revalidatePath("/appointments");
  revalidatePath("/");
  return { success: true, id: appointment._id.toString() };
}

export async function updateAppointment(id: string, data: AppointmentInput) {
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  await Appointment.findByIdAndUpdate(id, {
    personId: parsed.data.personId,
    dateTime: new Date(parsed.data.dateTime),
    durationMinutes: parsed.data.durationMinutes,
    type: parsed.data.type,
    location: parsed.data.location,
    doctorName: parsed.data.doctorName,
    specialty: parsed.data.specialty,
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  await dbConnect();
  await Appointment.findByIdAndUpdate(id, { status });
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function updateAppointmentNotes(id: string, notes: unknown) {
  await dbConnect();
  await Appointment.findByIdAndUpdate(id, { notes });
  revalidatePath(`/appointments/${id}`);
  return { success: true };
}

export async function deleteAppointment(id: string) {
  await dbConnect();
  await Appointment.findByIdAndUpdate(id, { isActive: false });
  revalidatePath("/appointments");
  revalidatePath("/");
  return { success: true };
}

export async function getAppointments(filters?: {
  personId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  await dbConnect();
  // Ensure Person model is registered for populate
  await Person.findOne().limit(0);

  const query: Record<string, unknown> = { isActive: true };

  if (filters?.personId) query.personId = filters.personId;
  if (filters?.status && filters.status !== "all") query.status = filters.status;
  if (filters?.startDate || filters?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    query.dateTime = dateFilter;
  }

  const appointments = await Appointment.find(query)
    .populate("personId")
    .sort({ dateTime: -1 })
    .lean();

  return appointments.map((a) =>
    serializeAppointment(a as unknown as Record<string, unknown>)
  );
}

export async function getAppointment(id: string) {
  await dbConnect();
  await Person.findOne().limit(0);

  const appointment = await Appointment.findOne({ _id: id, isActive: true })
    .populate("personId")
    .lean();

  if (!appointment) return null;

  return serializeAppointment(
    appointment as unknown as Record<string, unknown>
  );
}

export async function getTodayAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getAppointments({
    startDate: today.toISOString(),
    endDate: today.toISOString(),
  });
}

export async function getUpcomingAppointments(limit = 5) {
  await dbConnect();
  await Person.findOne().limit(0);

  const now = new Date();
  const appointments = await Appointment.find({
    isActive: true,
    dateTime: { $gte: now },
    status: { $in: ["scheduled", "in_progress"] },
  })
    .populate("personId")
    .sort({ dateTime: 1 })
    .limit(limit)
    .lean();

  return appointments.map((a) =>
    serializeAppointment(a as unknown as Record<string, unknown>)
  );
}

export async function getDistinctLocations(): Promise<string[]> {
  await dbConnect();
  const locations = await Appointment.distinct("location", {
    isActive: true,
    location: { $exists: true, $ne: "" },
  });
  return locations.filter(Boolean).sort();
}
