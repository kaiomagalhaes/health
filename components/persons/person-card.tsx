import Link from "next/link";
import { useTranslations } from "next-intl";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SerializedPerson } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PersonCard({ person }: { person: SerializedPerson }) {
  const t = useTranslations("persons");
  const dob = new Date(person.dateOfBirth);
  const age = differenceInYears(new Date(), dob);

  return (
    <Link href={`/people/${person.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{person.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {format(dob, "dd/MM/yyyy", { locale: ptBR })} &middot; {age}{" "}
              {t("age").toLowerCase()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
