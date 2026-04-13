"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Person } from "@/models/Person";
import { personSchema, type PersonInput } from "@/lib/validators/person";

export async function createPerson(data: PersonInput) {
  const parsed = personSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  const person = await Person.create({
    fullName: parsed.data.fullName,
    dateOfBirth: new Date(parsed.data.dateOfBirth),
  });

  revalidatePath("/people");
  revalidatePath("/");
  return { success: true, id: person._id.toString() };
}

export async function updatePerson(id: string, data: PersonInput) {
  const parsed = personSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  await Person.findByIdAndUpdate(id, {
    fullName: parsed.data.fullName,
    dateOfBirth: new Date(parsed.data.dateOfBirth),
  });

  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deletePerson(id: string) {
  await dbConnect();
  await Person.findByIdAndUpdate(id, { isActive: false });
  revalidatePath("/people");
  revalidatePath("/");
  return { success: true };
}

export async function getPersons(search?: string) {
  await dbConnect();

  const filter: Record<string, unknown> = { isActive: true };
  if (search) {
    filter.fullName = { $regex: search, $options: "i" };
  }

  const persons = await Person.find(filter)
    .sort({ fullName: 1 })
    .lean();

  return persons.map((p) => ({
    id: p._id.toString(),
    fullName: p.fullName,
    dateOfBirth: p.dateOfBirth.toISOString(),
    profilePhotoUrl: p.profilePhotoUrl,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function getPerson(id: string) {
  await dbConnect();

  const person = await Person.findOne({ _id: id, isActive: true }).lean();
  if (!person) return null;

  return {
    id: person._id.toString(),
    fullName: person.fullName,
    dateOfBirth: person.dateOfBirth.toISOString(),
    profilePhotoUrl: person.profilePhotoUrl,
    isActive: person.isActive,
    createdAt: person.createdAt.toISOString(),
    updatedAt: person.updatedAt.toISOString(),
  };
}
