"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personSchema, type PersonInput } from "@/lib/validators/person";
import { createPerson, updatePerson } from "@/actions/persons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SerializedPerson } from "@/types";
import { toast } from "sonner";

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
    <Card>
      <CardHeader>
        <CardTitle>{person ? t("editPerson") : t("newPerson")}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input id="fullName" type="text" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">
                {errors.dateOfBirth.message}
              </p>
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
