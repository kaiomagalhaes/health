import mongoose, { Schema, type Document } from "mongoose";

export interface IPerson extends Document {
  fullName: string;
  dateOfBirth: Date;
  profilePhotoUrl?: string;
  profilePhotoBlobPath?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    profilePhotoUrl: { type: String },
    profilePhotoBlobPath: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PersonSchema.index({ fullName: "text" });
PersonSchema.index({ createdAt: -1 });

export const Person =
  mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema);
