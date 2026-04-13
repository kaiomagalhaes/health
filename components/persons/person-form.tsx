"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personSchema, type PersonInput } from "@/lib/validators/person";
import { createPerson, updatePerson } from "@/actions/persons";
import {
  Button,
  Card,
  FormInput,
  FormLabel,
  SectionHeader,
} from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import type { SerializedPerson } from "@/types";

interface PersonFormProps {
  person?: SerializedPerson;
}

export function PersonForm({ person }: PersonFormProps) {
  const t = useTranslations("persons");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
    defaultValues: person
      ? {
          fullName: person.fullName,
          dateOfBirth: person.dateOfBirth.split("T")[0],
        }
      : undefined,
  });

  async function onSubmit(data: PersonInput) {
    setLoading(true);

    const result = person
      ? await updatePerson(person.id, data)
      : await createPerson(data);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success(person ? t("updated") : t("created"));
      router.push("/people");
    }
  }

  return (
    <Card padding="lg">
      <SectionHeader>{person ? t("editPerson") : t("newPerson")}</SectionHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <FormLabel htmlFor="fullName" required>{t("fullName")}</FormLabel>
          <FormInput
            id="fullName"
            type="text"
            error={!!errors.fullName}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabel htmlFor="dateOfBirth" required>{t("dateOfBirth")}</FormLabel>
          <FormInput
            id="dateOfBirth"
            type="date"
            error={!!errors.dateOfBirth}
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
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
