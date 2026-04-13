"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, EmptyState } from "@codelittinc/backstage-design-system";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import type { SerializedAppointment } from "@/types";
import { Clock, MapPin, Stethoscope, Calendar } from "lucide-react";

export function AppointmentList({
  appointments,
}: {
  appointments: SerializedAppointment[];
}) {
  const t = useTranslations("appointments");

  if (appointments.length === 0) {
    return (
      <EmptyState
        message={t("noAppointments")}
        icon={<Calendar className="h-8 w-8" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <Link key={apt.id} href={`/appointments/${apt.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {apt.person?.fullName ?? "—"}
                    </span>
                    <AppointmentStatusBadge status={apt.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(apt.dateTime), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    {apt.doctorName && (
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {apt.doctorName}
                        {apt.specialty && ` (${apt.specialty})`}
                      </span>
                    )}
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {apt.location}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {t(`types.${apt.type}`)}
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
