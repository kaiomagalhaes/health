import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPerson } from "@/actions/persons";
import { getDocuments } from "@/actions/documents";
import { getAccesses } from "@/actions/accesses";
import { Header } from "@/components/layout/header";
import { DocumentList } from "@/components/documents/document-list";
import { FileUpload } from "@/components/documents/file-upload";
import { AccessForm } from "@/components/accesses/access-form";
import { AccessList } from "@/components/accesses/access-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PersonDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = await getPerson(id);
  if (!person) notFound();

  const tDocs = await getTranslations("documents");
  const tAccesses = await getTranslations("accesses");
  const [documents, accesses] = await Promise.all([
    getDocuments({ personId: id }),
    getAccesses({ personId: id }),
  ]);

  return (
    <>
      <Header title={`${person.fullName} - ${tDocs("title")}`} />
      <main className="flex-1 p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{tDocs("upload")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload personId={id} />
          </CardContent>
        </Card>
        <DocumentList documents={documents} />

        <Card>
          <CardHeader>
            <CardTitle>{tAccesses("newAccess")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccessForm personId={id} />
          </CardContent>
        </Card>
        <AccessList accesses={accesses} />
      </main>
    </>
  );
}
