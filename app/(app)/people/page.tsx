import { getTranslations } from "next-intl/server";
import { getPersons } from "@/actions/persons";
import { Header } from "@/components/layout/header";
import { PersonList } from "@/components/persons/person-list";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function PersonsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("persons");
  const { q } = await searchParams;
  const persons = await getPersons(q);

  return (
    <>
      <Header title={t("title")} />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <form className="flex-1 max-w-sm">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </form>
          <Link
            href="/people/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("newPerson")}
          </Link>
        </div>
        <PersonList persons={persons} />
      </main>
    </>
  );
}
