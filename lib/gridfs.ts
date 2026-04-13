import mongoose from "mongoose";
import { Readable } from "stream";
import { dbConnect } from "./db";

function getBucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db!);
}

export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, unknown>
): Promise<mongoose.Types.ObjectId> {
  await dbConnect();
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);
    const uploadStream = bucket.openUploadStream(filename, { metadata });

    readable.pipe(uploadStream);

    uploadStream.on("finish", () => {
      resolve(uploadStream.id as mongoose.Types.ObjectId);
    });

    uploadStream.on("error", reject);
  });
}

export async function downloadFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<{ stream: Readable; file: { filename: string; contentType?: string; length: number } }> {
  await dbConnect();
  const bucket = getBucket();

  const files = await bucket.find({ _id: fileId }).toArray();
  if (files.length === 0) {
    throw new Error("File not found");
  }

  const file = files[0];
  const stream = bucket.openDownloadStream(fileId);

  return {
    stream,
    file: {
      filename: file.filename,
      contentType: file.metadata?.contentType as string | undefined,
      length: file.length,
    },
  };
}

export async function deleteFromGridFS(
  fileId: mongoose.Types.ObjectId
): Promise<void> {
  await dbConnect();
  const bucket = getBucket();
  await bucket.delete(fileId);
}
