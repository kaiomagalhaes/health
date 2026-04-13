"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accessSchema, type AccessInput } from "@/lib/validators/access";
import { createAccess, updateAccess } from "@/actions/accesses";
import type { SerializedAccess } from "@/actions/accesses";
import { Button, FormInput, FormLabel } from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import { Eye, EyeOff } from "lucide-react";

interface AccessFormProps {
  personId: string;
  appointmentId?: string;
  access?: SerializedAccess;
  onSaved?: () => void;
}

export function AccessForm({
  personId,
  appointmentId,
  access,
  onSaved,
}: AccessFormProps) {
  const t = useTranslations("accesses");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccessInput>({
    resolver: zodResolver(accessSchema),
    defaultValues: access
      ? {
          personId: access.personId,
          appointmentId: access.appointmentId,
          websiteUrl: access.websiteUrl,
          login: access.login,
          password: access.password,
          description: access.description ?? "",
        }
      : {
          personId,
          appointmentId: appointmentId ?? "",
          websiteUrl: "",
          login: "",
          password: "",
          description: "",
        },
  });

  async function onSubmit(data: AccessInput) {
    setLoading(true);

    const result = access
      ? await updateAccess(access.id, data)
      : await createAccess(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(access ? t("updated") : t("created"));
      if (!access) reset();
      router.refresh();
      onSaved?.();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="hidden" {...register("personId")} />
      <input type="hidden" {...register("appointmentId")} />

      <div className="space-y-1.5">
        <FormLabel htmlFor="description" className="text-xs">
          {t("description")}
        </FormLabel>
        <FormInput
          id="description"
          type="text"
          placeholder="Ex: Portal do paciente"
          {...register("description")}
        />
      </div>

      <div className="space-y-1.5">
        <FormLabel htmlFor="websiteUrl" className="text-xs" required>
          {t("websiteUrl")}
        </FormLabel>
        <FormInput
          id="websiteUrl"
          type="url"
          placeholder="https://..."
          error={!!errors.websiteUrl}
          {...register("websiteUrl")}
        />
        {errors.websiteUrl && (
          <p className="text-xs text-red-500">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FormLabel htmlFor="login" className="text-xs" required>
            {t("login")}
          </FormLabel>
          <FormInput
            id="login"
            type="text"
            error={!!errors.login}
            {...register("login")}
          />
          {errors.login && (
            <p className="text-xs text-red-500">{errors.login.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabel htmlFor="password" className="text-xs" required>
            {t("password")}
          </FormLabel>
          <div className="relative">
            <FormInput
              id="password"
              type={showPassword ? "text" : "password"}
              className="pr-9"
              error={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="primary" size="sm" disabled={loading}>
          {loading ? "..." : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
