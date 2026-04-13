import { getTranslations } from "next-intl/server";
import { getPersons } from "@/actions/persons";
import { getDistinctLocations } from "@/actions/appointments";
import { Header } from "@/components/layout/header";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ personId?: string }>;
}) {
  const t = await getTranslations("appointments");
  const { personId } = await searchParams;
  const [persons, existingLocations] = await Promise.all([
    getPersons(),
    getDistinctLocations(),
  ]);

  return (
    <>
      <Header title={t("newAppointment")} />
      <main className="flex-1 p-6 max-w-2xl">
        <AppointmentForm
          persons={persons}
          defaultPersonId={personId}
          existingLocations={existingLocations}
        />
      </main>
    </>
  );
}
