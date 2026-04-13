import { getTranslations } from "next-intl/server";
import { getDocuments } from "@/actions/documents";
import { Header } from "@/components/layout/header";
import { DocumentList } from "@/components/documents/document-list";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const t = await getTranslations("documents");
  const { category } = await searchParams;
  const documents = await getDocuments({ category });

  return (
    <>
      <Header title={t("title")} />
      <main className="flex-1 p-6 space-y-6">
        <DocumentList documents={documents} />
      </main>
    </>
  );
}
