import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { uploadToGridFS } from "@/lib/gridfs";
import { DocumentModel } from "@/models/Document";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "audio/x-m4a",
];

const MAX_SIZES: Record<string, number> = {
  "image/": 10 * 1024 * 1024, // 10MB
  "application/pdf": 25 * 1024 * 1024, // 25MB
  "audio/": 50 * 1024 * 1024, // 50MB
};

function getMaxSize(mimeType: string): number {
  for (const [prefix, size] of Object.entries(MAX_SIZES)) {
    if (mimeType.startsWith(prefix)) return size;
  }
  return 10 * 1024 * 1024;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const personId = formData.get("personId") as string | null;
  const appointmentId = formData.get("appointmentId") as string | null;
  const category = formData.get("category") as string | null;
  const description = formData.get("description") as string | null;

  if (!file || !personId) {
    return NextResponse.json(
      { error: "File and person are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed" },
      { status: 400 }
    );
  }

  const maxSize = getMaxSize(file.type);
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB` },
      { status: 400 }
    );
  }

  await dbConnect();

  const buffer = Buffer.from(await file.arrayBuffer());

  const gridFsFileId = await uploadToGridFS(buffer, file.name, {
    personId,
    category: category ?? "other",
    contentType: file.type,
    originalName: file.name,
  });

  const doc = await DocumentModel.create({
    personId,
    appointmentId: appointmentId || undefined,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    gridFsFileId,
    category: category ?? "other",
    description: description || undefined,
  });

  return NextResponse.json({
    id: doc._id.toString(),
    gridFsFileId: gridFsFileId.toString(),
  });
}
