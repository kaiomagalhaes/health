import mongoose, { Schema, type Document } from "mongoose";

export interface IAppointment extends Document {
  personId: mongoose.Types.ObjectId;
  dateTime: Date;
  durationMinutes: number;
  type: string;
  status: string;
  location?: string;
  doctorName?: string;
  specialty?: string;
  notes?: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    personId: {
      type: Schema.Types.ObjectId,
      ref: "Person",
      required: true,
    },
    dateTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 50 },
    type: {
      type: String,
      enum: ["consultation", "follow_up", "exam", "emergency", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },
    location: { type: String, trim: true },
    doctorName: { type: String, trim: true },
    specialty: { type: String, trim: true },
    notes: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AppointmentSchema.index({ dateTime: -1 });
AppointmentSchema.index({ personId: 1, dateTime: -1 });
AppointmentSchema.index({ status: 1, dateTime: 1 });

export const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
