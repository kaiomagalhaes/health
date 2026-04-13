"use client";

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";

export function Providers({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} timeZone="America/Sao_Paulo" messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
