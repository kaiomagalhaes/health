"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types";

const statusVariant: Record<AppointmentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "default",
  in_progress: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const t = useTranslations("appointments.statuses");

  return <Badge variant={statusVariant[status]}>{t(status)}</Badge>;
}
