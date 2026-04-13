import mongoose, { Schema, type Document } from "mongoose";

export interface IAccess extends Document {
  personId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  websiteUrl: string;
  login: string;
  password: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccessSchema = new Schema<IAccess>(
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
    websiteUrl: { type: String, required: true, trim: true },
    login: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AccessSchema.index({ personId: 1, createdAt: -1 });
AccessSchema.index({ appointmentId: 1 });

export const Access =
  mongoose.models.Access || mongoose.model<IAccess>("Access", AccessSchema);
