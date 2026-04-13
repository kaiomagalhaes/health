"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-1">
        <Label className="text-xs">{t("status")}</Label>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            const val = v ?? "all";
            setStatusFilter(val);
            updateFilter("status", val);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue>
              {statusFilter === "all"
                ? t("filters.all")
                : t(`statuses.${statusFilter}`)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.all")}</SelectItem>
            {(
              ["scheduled", "in_progress", "completed", "cancelled"] as const
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("filters.startDate")}</Label>
        <Input
          type="date"
          defaultValue={searchParams.get("startDate") ?? ""}
          onChange={(e) => updateFilter("startDate", e.target.value)}
          className="w-[160px]"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("filters.endDate")}</Label>
        <Input
          type="date"
          defaultValue={searchParams.get("endDate") ?? ""}
          onChange={(e) => updateFilter("endDate", e.target.value)}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
