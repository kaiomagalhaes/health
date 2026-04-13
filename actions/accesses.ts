"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Access } from "@/models/Access";
import { Person } from "@/models/Person";
import { accessSchema, type AccessInput } from "@/lib/validators/access";

export interface SerializedAccess {
  id: string;
  personId: string;
  personName?: string;
  appointmentId?: string;
  websiteUrl: string;
  login: string;
  password: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function serializeAccess(a: Record<string, unknown>): SerializedAccess {
  const person = a.personId as Record<string, unknown> | undefined;
  return {
    id: String(a._id),
    personId: person?._id ? String(person._id) : String(a.personId),
    personName: person?.fullName ? String(person.fullName) : undefined,
    appointmentId: a.appointmentId ? String(a.appointmentId) : undefined,
    websiteUrl: String(a.websiteUrl),
    login: String(a.login),
    password: String(a.password),
    description: a.description ? String(a.description) : undefined,
    isActive: Boolean(a.isActive),
    createdAt: (a.createdAt as Date).toISOString(),
    updatedAt: (a.updatedAt as Date).toISOString(),
  };
}

export async function createAccess(data: AccessInput) {
  const parsed = accessSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  await Access.create({
    personId: parsed.data.personId,
    appointmentId: parsed.data.appointmentId || undefined,
    websiteUrl: parsed.data.websiteUrl,
    login: parsed.data.login,
    password: parsed.data.password,
    description: parsed.data.description || undefined,
  });

  revalidatePath("/people");
  revalidatePath("/appointments");
  return { success: true };
}

export async function updateAccess(id: string, data: AccessInput) {
  const parsed = accessSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  await Access.findByIdAndUpdate(id, {
    websiteUrl: parsed.data.websiteUrl,
    login: parsed.data.login,
    password: parsed.data.password,
    description: parsed.data.description || undefined,
  });

  revalidatePath("/people");
  revalidatePath("/appointments");
  return { success: true };
}

export async function deleteAccess(id: string) {
  await dbConnect();
  await Access.findByIdAndUpdate(id, { isActive: false });
  revalidatePath("/people");
  revalidatePath("/appointments");
  return { success: true };
}

export async function getAccesses(filters?: {
  personId?: string;
  appointmentId?: string;
}) {
  await dbConnect();
  await Person.findOne().limit(0);

  const query: Record<string, unknown> = { isActive: true };
  if (filters?.personId) query.personId = filters.personId;
  if (filters?.appointmentId) query.appointmentId = filters.appointmentId;

  const accesses = await Access.find(query)
    .populate("personId")
    .sort({ createdAt: -1 })
    .lean();

  return accesses.map((a) =>
    serializeAccess(a as unknown as Record<string, unknown>)
  );
}
