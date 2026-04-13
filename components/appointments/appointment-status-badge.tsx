"use client";

import { useTranslations } from "next-intl";
import type { AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const t = useTranslations("appointments.statuses");

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap",
        statusStyles[status]
      )}
    >
      {t(status)}
    </span>
  );
}
