import { getTranslations } from "next-intl/server";
import { getAppointments } from "@/actions/appointments";
import { Header } from "@/components/layout/header";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { AppointmentFilters } from "@/components/appointments/appointment-filters";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const t = await getTranslations("appointments");
  const filters = await searchParams;
  const appointments = await getAppointments(filters);

  return (
    <>
      <Header title={t("title")} />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <AppointmentFilters />
          <Link
            href="/appointments/new"
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
