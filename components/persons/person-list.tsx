"use client";

import { useTranslations } from "next-intl";
import { PersonCard } from "./person-card";
import type { SerializedPerson } from "@/types";

export function PersonList({ persons }: { persons: SerializedPerson[] }) {
  const t = useTranslations("persons");

  if (persons.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {t("noPersons")}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {persons.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
