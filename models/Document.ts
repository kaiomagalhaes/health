import mongoose, { Schema, type Document as MongoDocument } from "mongoose";

export interface IDocument extends MongoDocument {
  personId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  gridFsFileId: mongoose.Types.ObjectId;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    gridFsFileId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    category: {
      type: String,
      enum: ["exam", "prescription", "recording", "report", "other"],
      default: "other",
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

DocumentSchema.index({ personId: 1, createdAt: -1 });
DocumentSchema.index({ appointmentId: 1 });

export const DocumentModel =
  mongoose.models.Document ||
  mongoose.model<IDocument>("Document", DocumentSchema);
