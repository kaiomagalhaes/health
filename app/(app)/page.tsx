import { getTranslations } from "next-intl/server";
import { getPersons } from "@/actions/persons";
import {
  getTodayAppointments,
  getUpcomingAppointments,
} from "@/actions/appointments";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
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
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("newPerson")}
          </Link>
          <Link
            href="/appointments/new"
            className={buttonVariants({ variant: "outline" })}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("newAppointment")}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                {t("todayAppointments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noAppointmentsToday")}
                </p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/appointments/${apt.id}`}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {apt.person?.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5" />
                {t("upcomingAppointments")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("noUpcomingAppointments")}
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/appointments/${apt.id}`}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {apt.person?.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(
                            new Date(apt.dateTime),
                            "dd/MM HH:mm",
                            { locale: ptBR }
                          )}
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
            </CardContent>
          </Card>
        </div>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              {t("familyMembers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {persons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
{tPersons("noPersons")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {persons.map((person) => (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(person.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {person.fullName}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
