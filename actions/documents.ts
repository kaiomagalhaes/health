"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { DocumentModel } from "@/models/Document";
import { Person } from "@/models/Person";
import { deleteFromGridFS } from "@/lib/gridfs";
import type { SerializedDocument } from "@/types";

function serializeDocument(d: Record<string, unknown>): SerializedDocument {
  const person = d.personId as Record<string, unknown> | undefined;
  return {
    id: String(d._id),
    personId: person?._id ? String(person._id) : String(d.personId),
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
    appointmentId: d.appointmentId ? String(d.appointmentId) : undefined,
    fileName: String(d.fileName),
    fileType: String(d.fileType),
    fileSize: Number(d.fileSize),
    gridFsFileId: String(d.gridFsFileId),
    category: String(d.category) as SerializedDocument["category"],
    description: d.description ? String(d.description) : undefined,
    isActive: Boolean(d.isActive),
    createdAt: (d.createdAt as Date).toISOString(),
    updatedAt: (d.updatedAt as Date).toISOString(),
  };
}

export async function getDocuments(filters?: {
  personId?: string;
  appointmentId?: string;
  category?: string;
}) {
  await dbConnect();
  await Person.findOne().limit(0);

  const query: Record<string, unknown> = { isActive: true };
  if (filters?.personId) query.personId = filters.personId;
  if (filters?.appointmentId) query.appointmentId = filters.appointmentId;
  if (filters?.category && filters.category !== "all")
    query.category = filters.category;

  const documents = await DocumentModel.find(query)
    .populate("personId")
    .sort({ createdAt: -1 })
    .lean();

  return documents.map((d) =>
    serializeDocument(d as unknown as Record<string, unknown>)
  );
}

export async function deleteDocument(id: string) {
  await dbConnect();

  const doc = await DocumentModel.findById(id);
  if (!doc) return { error: "Document not found" };

  try {
    await deleteFromGridFS(
      doc.gridFsFileId as mongoose.Types.ObjectId
    );
  } catch {
    // File might already be deleted from GridFS
  }

  await DocumentModel.findByIdAndUpdate(id, { isActive: false });
  revalidatePath("/documents");
  return { success: true };
}
