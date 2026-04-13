import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { Header } from "@/components/layout/header";
import { Card } from "@codelittinc/backstage-design-system";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DeletePersonButton } from "@/components/persons/delete-person-button";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Calendar, FileText } from "lucide-react";
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const t = await getTranslations("persons");
  const tNav = await getTranslations("nav");
  const dob = new Date(person.dateOfBirth);
  const age = differenceInYears(new Date(), dob);

  return (
    <>
      <Header title={person.fullName} />
      <main className="flex-1 p-6 space-y-6">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(person.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{person.fullName}</h2>
                <p className="text-gray-500">
                  {format(dob, "dd/MM/yyyy", { locale: ptBR })} &middot;{" "}
                  {age} {t("age").toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/people/${person.id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                {t("editPerson")}
              </Link>
              <DeletePersonButton personId={person.id} />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href={`/people/${person.id}/appointments`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{tNav("appointments")}</span>
              </div>
            </Card>
          </Link>
          <Link href={`/people/${person.id}/documents`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{tNav("documents")}</span>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
