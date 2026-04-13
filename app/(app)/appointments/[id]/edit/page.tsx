import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAppointment, getDistinctLocations } from "@/actions/appointments";
import { getPersons } from "@/actions/persons";
import { Header } from "@/components/layout/header";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [appointment, persons, existingLocations] = await Promise.all([
    getAppointment(id),
    getPersons(),
    getDistinctLocations(),
  ]);
  if (!appointment) notFound();

  const t = await getTranslations("appointments");

  return (
    <>
      <Header title={t("editAppointment")} />
      <main className="flex-1 p-6 max-w-2xl">
        <AppointmentForm
          persons={persons}
          appointment={appointment}
          existingLocations={existingLocations}
        />
      </main>
    </>
  );
}
