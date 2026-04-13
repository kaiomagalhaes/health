"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormInput, FormLabel, FormSelect } from "@codelittinc/backstage-design-system";

export function AppointmentFilters() {
  const t = useTranslations("appointments");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") ?? "all"
  );

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/appointments?${params.toString()}`);
  }

  const statusOptions = [
    { value: "all", label: t("filters.all") },
    ...["scheduled", "in_progress", "completed", "cancelled"].map((s) => ({
      value: s,
      label: t(`statuses.${s}`),
    })),
  ];

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-1">
        <FormLabel className="text-xs">{t("status")}</FormLabel>
        <FormSelect
          value={statusFilter}
          onChange={(v) => {
            const val = v ?? "all";
            setStatusFilter(val);
            updateFilter("status", val);
          }}
          options={statusOptions}
        />
      </div>
      <div className="space-y-1">
        <FormLabel className="text-xs">{t("filters.startDate")}</FormLabel>
        <FormInput
          type="date"
          defaultValue={searchParams.get("startDate") ?? ""}
          onChange={(e) => updateFilter("startDate", e.target.value)}
          className="w-[160px]"
        />
      </div>
      <div className="space-y-1">
        <FormLabel className="text-xs">{t("filters.endDate")}</FormLabel>
        <FormInput
          type="date"
          defaultValue={searchParams.get("endDate") ?? ""}
          onChange={(e) => updateFilter("endDate", e.target.value)}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
