import { getTranslations } from "next-intl/server";
import { getPersons } from "@/actions/persons";
import {
  getTodayAppointments,
  getUpcomingAppointments,
} from "@/actions/appointments";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Users, Calendar, Plus, Clock, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const tPersons = await getTranslations("persons");
  const [persons, todayAppointments, upcomingAppointments] = await Promise.all([
    getPersons(),
    getTodayAppointments(),
    getUpcomingAppointments(),
  ]);

  return (
    <>
      <Header title={t("title")} />
      <main className="flex-1 p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link
            href="/people/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("newPerson")}
          </Link>
          <Link
            href="/appointments/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("newAppointment")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Appointments */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              {t("todayAppointments")}
            </h3>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">{t("noAppointmentsToday")}</p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/appointments/${apt.id}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.person?.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.dateTime), "HH:mm")}
                        {apt.doctorName && (
                          <>
                            <Stethoscope className="h-3 w-3 ml-1" />
                            {apt.doctorName}
                          </>
                        )}
                      </div>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              {t("upcomingAppointments")}
            </h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("noUpcomingAppointments")}
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/appointments/${apt.id}`}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {apt.person?.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(new Date(apt.dateTime), "dd/MM HH:mm", {
                          locale: ptBR,
                        })}
                        {apt.doctorName && (
                          <>
                            <Stethoscope className="h-3 w-3 ml-1" />
                            {apt.doctorName}
                          </>
                        )}
                      </div>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Family Members */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <Users className="h-5 w-5 text-primary" />
            {t("familyMembers")}
          </h3>
          {persons.length === 0 ? (
            <p className="text-sm text-gray-500">{tPersons("noPersons")}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {persons.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(person.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{person.fullName}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
