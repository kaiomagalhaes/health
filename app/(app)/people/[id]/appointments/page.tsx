import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { getAppointments } from "@/actions/appointments";
import { Header } from "@/components/layout/header";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PersonAppointmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const t = await getTranslations("appointments");
  const appointments = await getAppointments({ personId: id });

  return (
    <>
      <Header title={`${person.fullName} - ${t("title")}`} />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex justify-end">
          <Link
            href={`/appointments/new?personId=${id}`}
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("newAppointment")}
          </Link>
        </div>
        <AppointmentList appointments={appointments} />
      </main>
    </>
  );
}
