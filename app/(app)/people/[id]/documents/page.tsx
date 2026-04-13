import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { getDocuments } from "@/actions/documents";
import { Header } from "@/components/layout/header";
import { DocumentList } from "@/components/documents/document-list";
import { FileUpload } from "@/components/documents/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PersonDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const t = await getTranslations("documents");
  const documents = await getDocuments({ personId: id });

  return (
    <>
      <Header title={`${person.fullName} - ${t("title")}`} />
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("upload")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload personId={id} />
          </CardContent>
        </Card>
        <DocumentList documents={documents} />
      </main>
    </>
  );
}
