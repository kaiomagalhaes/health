import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAppointment } from "@/actions/appointments";
import { getDocuments } from "@/actions/documents";
import { getAccesses } from "@/actions/accesses";
import { AccessForm } from "@/components/accesses/access-form";
import { AccessList } from "@/components/accesses/access-list";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ClinicalNotesEditor } from "@/components/appointments/clinical-notes-editor";
import {
  AppointmentStatusSelect,
  DeleteAppointmentButton,
} from "@/components/appointments/appointment-actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileUpload } from "@/components/documents/file-upload";
import { DocumentList } from "@/components/documents/document-list";
import { Pencil, Clock, MapPin, Stethoscope, User } from "lucide-react";
import Link from "next/link";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const t = await getTranslations("appointments");
  const tDocs = await getTranslations("documents");
  const tAccesses = await getTranslations("accesses");
  const [documents, accesses] = await Promise.all([
    getDocuments({ appointmentId: id }),
    getAccesses({ appointmentId: id }),
  ]);

  return (
    <>
      <Header
        title={`${appointment.person?.fullName ?? ""} - ${t(
          `types.${appointment.type}`
        )}`}
      />
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(appointment.dateTime), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                  {" - "}
                  {appointment.durationMinutes} min
                </div>
                {appointment.person && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <Link
                      href={`/people/${appointment.personId}`}
                      className="hover:underline"
                    >
                      {appointment.person.fullName}
                    </Link>
                  </div>
                )}
                {appointment.doctorName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    {appointment.doctorName}
                    {appointment.specialty &&
                      ` (${appointment.specialty})`}
                  </div>
                )}
                {appointment.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {appointment.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AppointmentStatusSelect
                  appointmentId={appointment.id}
                  currentStatus={appointment.status}
                />
                <Link
                  href={`/appointments/${appointment.id}/edit`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {t("editAppointment")}
                </Link>
                <DeleteAppointmentButton appointmentId={appointment.id} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ClinicalNotesEditor
              appointmentId={appointment.id}
              initialContent={appointment.notes}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDocs("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUpload
              personId={appointment.personId}
              appointmentId={appointment.id}
            />
            <DocumentList documents={documents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tAccesses("title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AccessForm
              personId={appointment.personId}
              appointmentId={appointment.id}
            />
            <AccessList accesses={accesses} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
