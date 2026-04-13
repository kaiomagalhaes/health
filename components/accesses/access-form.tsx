"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accessSchema, type AccessInput } from "@/lib/validators/access";
import { createAccess, updateAccess } from "@/actions/accesses";
import type { SerializedAccess } from "@/actions/accesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

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
        <Label htmlFor="description" className="text-xs">
          {t("description")}
        </Label>
        <Input
          id="description"
          type="text"
          placeholder="Ex: Portal do paciente"
          {...register("description")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="websiteUrl" className="text-xs">
          {t("websiteUrl")}
        </Label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder="https://..."
          {...register("websiteUrl")}
        />
        {errors.websiteUrl && (
          <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="login" className="text-xs">
            {t("login")}
          </Label>
          <Input id="login" type="text" {...register("login")} />
          {errors.login && (
            <p className="text-xs text-destructive">{errors.login.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs">
            {t("password")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pr-9"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "..." : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
