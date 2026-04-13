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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SerializedAppointment, SerializedPerson } from "@/types";
import { toast } from "sonner";
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

  // Person select state
  const [selectedPersonId, setSelectedPersonId] = useState(
    appointment?.personId ?? defaultPersonId ?? ""
  );

  // Type select state
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

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {appointment ? t("editAppointment") : t("newAppointment")}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("person")}</Label>
            <Select
              value={selectedPersonId}
              onValueChange={(value) => {
                const v = value ?? "";
                setSelectedPersonId(v);
                setValue("personId", v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedPersonId
                    ? persons.find((p) => p.id === selectedPersonId)?.fullName
                    : tPersons("selectPerson")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {persons.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.personId && (
              <p className="text-sm text-destructive">
                {errors.personId.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateTime">{t("dateTime")}</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                {...register("dateTime")}
              />
              {errors.dateTime && (
                <p className="text-sm text-destructive">
                  {errors.dateTime.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">{t("duration")}</Label>
              <Input
                id="durationMinutes"
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("type")}</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                const v = (value ?? "consultation") as AppointmentInput["type"];
                setSelectedType(v);
                setValue("type", v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {t(`types.${selectedType}`)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "consultation",
                    "follow_up",
                    "exam",
                    "emergency",
                    "other",
                  ] as const
                ).map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="doctorName">{t("doctorName")}</Label>
              <Input id="doctorName" type="text" {...register("doctorName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">{t("specialty")}</Label>
              <Input id="specialty" type="text" {...register("specialty")} />
            </div>
          </div>

          <div className="space-y-2 relative" ref={locationRef}>
            <Label htmlFor="location">{t("location")}</Label>
            <Input
              id="location"
              type="text"
              value={locationValue}
              onChange={(e) => handleLocationChange(e.target.value)}
              onFocus={() => {
                if (existingLocations.length > 0) {
                  setFilteredLocations(
                    locationValue
                      ? existingLocations.filter((loc) =>
                          loc
                            .toLowerCase()
                            .includes(locationValue.toLowerCase())
                        )
                      : existingLocations
                  );
                  setLocationOpen(true);
                }
              }}
              autoComplete="off"
            />
            {locationOpen && filteredLocations.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => selectLocation(loc)}
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "..." : tCommon("save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {tCommon("cancel")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
