"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentSchema,
  type AppointmentInput,
} from "@/lib/validators/appointment";
import { createAppointment, updateAppointment } from "@/actions/appointments";
import {
  Button,
  Card,
  FormInput,
  FormLabel,
  FormSelect,
  SectionHeader,
} from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import type { SerializedAppointment, SerializedPerson } from "@/types";
import { MapPin } from "lucide-react";

interface AppointmentFormProps {
  persons: SerializedPerson[];
  appointment?: SerializedAppointment;
  defaultPersonId?: string;
  existingLocations?: string[];
}

export function AppointmentForm({
  persons,
  appointment,
  defaultPersonId,
  existingLocations = [],
}: AppointmentFormProps) {
  const t = useTranslations("appointments");
  const tPersons = useTranslations("persons");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [selectedPersonId, setSelectedPersonId] = useState(
    appointment?.personId ?? defaultPersonId ?? ""
  );
  const [selectedType, setSelectedType] = useState<AppointmentInput["type"]>(
    appointment?.type ?? "consultation"
  );

  // Location combobox state
  const [locationValue, setLocationValue] = useState(
    appointment?.location ?? ""
  );
  const [locationOpen, setLocationOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(existingLocations);
  const locationRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          personId: appointment.personId,
          dateTime: appointment.dateTime.slice(0, 16),
          durationMinutes: appointment.durationMinutes,
          type: appointment.type,
          location: appointment.location ?? "",
          doctorName: appointment.doctorName ?? "",
          specialty: appointment.specialty ?? "",
        }
      : {
          personId: defaultPersonId ?? "",
          durationMinutes: 50,
          type: "consultation",
          location: "",
        },
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLocationChange(value: string) {
    setLocationValue(value);
    setValue("location", value);
    setFilteredLocations(
      existingLocations.filter((loc) =>
        loc.toLowerCase().includes(value.toLowerCase())
      )
    );
    setLocationOpen(value.length > 0 && existingLocations.length > 0);
  }

  function selectLocation(loc: string) {
    setLocationValue(loc);
    setValue("location", loc);
    setLocationOpen(false);
  }

  async function onSubmit(data: AppointmentInput) {
    setLoading(true);
    const result = appointment
      ? await updateAppointment(appointment.id, data)
      : await createAppointment(data);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(appointment ? t("updated") : t("created"));
      router.push("/appointments");
    }
  }

  const personOptions = persons.map((p) => ({ value: p.id, label: p.fullName }));
  const typeOptions = (
    ["consultation", "follow_up", "exam", "emergency", "other"] as const
  ).map((type) => ({ value: type, label: t(`types.${type}`) }));

  return (
    <Card padding="lg">
      <SectionHeader>
        {appointment ? t("editAppointment") : t("newAppointment")}
      </SectionHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <FormLabel required>{t("person")}</FormLabel>
          <FormSelect
            value={selectedPersonId}
            onChange={(val) => {
              setSelectedPersonId(val ?? "");
              setValue("personId", val ?? "");
            }}
            options={personOptions}
            placeholder={tPersons("selectPerson")}
            error={!!errors.personId}
          />
          {errors.personId && (
            <p className="text-sm text-red-500">{errors.personId.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FormLabel htmlFor="dateTime" required>{t("dateTime")}</FormLabel>
            <FormInput
              id="dateTime"
              type="datetime-local"
              error={!!errors.dateTime}
              {...register("dateTime")}
            />
            {errors.dateTime && (
              <p className="text-sm text-red-500">{errors.dateTime.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <FormLabel htmlFor="durationMinutes">{t("duration")}</FormLabel>
            <FormInput
              id="durationMinutes"
              type="number"
              {...register("durationMinutes", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <FormLabel required>{t("type")}</FormLabel>
          <FormSelect
            value={selectedType}
            onChange={(val) => {
              const v = (val ?? "consultation") as AppointmentInput["type"];
              setSelectedType(v);
              setValue("type", v);
            }}
            options={typeOptions}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FormLabel htmlFor="doctorName">{t("doctorName")}</FormLabel>
            <FormInput id="doctorName" type="text" {...register("doctorName")} />
          </div>
          <div className="space-y-1.5">
            <FormLabel htmlFor="specialty">{t("specialty")}</FormLabel>
            <FormInput id="specialty" type="text" {...register("specialty")} />
          </div>
        </div>

        <div className="space-y-1.5 relative" ref={locationRef}>
          <FormLabel htmlFor="location">{t("location")}</FormLabel>
          <FormInput
            id="location"
            type="text"
            value={locationValue}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => {
              if (existingLocations.length > 0) {
                setFilteredLocations(
                  locationValue
                    ? existingLocations.filter((loc) =>
                        loc.toLowerCase().includes(locationValue.toLowerCase())
                      )
                    : existingLocations
                );
                setLocationOpen(true);
              }
            }}
            autoComplete="off"
          />
          {locationOpen && filteredLocations.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white p-1 shadow-md">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100"
                  onClick={() => selectLocation(loc)}
                >
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="primary" disabled={loading}>
            {loading ? "..." : tCommon("save")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            {tCommon("cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
