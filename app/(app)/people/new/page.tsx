import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { PersonForm } from "@/components/persons/person-form";

export default async function NewPersonPage() {
  const t = await getTranslations("persons");

  return (
    <>
      <Header title={t("newPerson")} />
      <main className="flex-1 p-6 max-w-2xl">
        <PersonForm />
      </main>
    </>
  );
}
