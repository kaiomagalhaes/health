"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import {
  Button,
  Card,
  FormInput,
  FormLabel,
  ErrorAlert,
} from "@codelittinc/backstage-design-system";
import Link from "next/link";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("invalidCredentials"));
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <Card padding="lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">{t("loginTitle")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("loginSubtitle")}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
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
            autoComplete="current-password"
            error={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <Button variant="primary" size="lg" disabled={loading} className="w-full">
          {loading ? "..." : t("login")}
        </Button>
        <p className="text-sm text-center text-gray-500">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            {t("register")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
