"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { registerUser } from "@/actions/auth";
import {
  Button,
  Card,
  FormInput,
  FormLabel,
  ErrorAlert,
} from "@codelittinc/backstage-design-system";
import Link from "next/link";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    setError(null);

    const result = await registerUser(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <Card padding="lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">{t("registerTitle")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("registerSubtitle")}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        <div className="space-y-1.5">
          <FormLabel htmlFor="name">{t("name")}</FormLabel>
          <FormInput
            id="name"
            type="text"
            autoComplete="name"
            error={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabel htmlFor="email">{t("email")}</FormLabel>
          <FormInput
            id="email"
            type="email"
            autoComplete="email"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabel htmlFor="password">{t("password")}</FormLabel>
          <FormInput
            id="password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabel htmlFor="confirmPassword">{t("confirmPassword")}</FormLabel>
          <FormInput
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button variant="primary" size="lg" disabled={loading} className="w-full">
          {loading ? "..." : t("register")}
        </Button>
        <p className="text-sm text-center text-gray-500">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t("login")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
