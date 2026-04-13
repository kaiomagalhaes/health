export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPerson {
  id: string;
  fullName: string;
  dateOfBirth: string;
  profilePhotoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType =
  | "consultation"
  | "follow_up"
  | "exam"
  | "emergency"
  | "other";

export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface SerializedAppointment {
  id: string;
  personId: string;
  person?: SerializedPerson;
  dateTime: string;
  durationMinutes: number;
  type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  doctorName?: string;
  specialty?: string;
  notes?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory =
  | "exam"
  | "prescription"
  | "recording"
  | "report"
  | "other";

export interface SerializedDocument {
  id: string;
  personId: string;
  person?: SerializedPerson;
  appointmentId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  gridFsFileId: string;
  category: DocumentCategory;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
