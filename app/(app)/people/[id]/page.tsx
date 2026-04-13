import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(person.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{person.fullName}</CardTitle>
                  <p className="text-muted-foreground">
                    {format(dob, "dd/MM/yyyy", { locale: ptBR })} &middot;{" "}
                    {age} {t("age").toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/people/${person.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  {t("editPerson")}
                </Link>
                <DeletePersonButton personId={person.id} />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href={`/people/${person.id}/appointments`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tNav("appointments")}</span>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/people/${person.id}/documents`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{tNav("documents")}</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
