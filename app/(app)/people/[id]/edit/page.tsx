import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { Header } from "@/components/layout/header";
import { PersonForm } from "@/components/persons/person-form";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const t = await getTranslations("persons");

  return (
    <>
      <Header title={t("editPerson")} />
      <main className="flex-1 p-6 max-w-2xl">
        <PersonForm person={person} />
      </main>
    </>
  );
}
