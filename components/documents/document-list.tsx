"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { deleteDocument } from "@/actions/documents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Image,
  Mic,
  File,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import type { SerializedDocument } from "@/types";
import { toast } from "sonner";

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("audio/")) return Mic;
  if (fileType === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
}: {
  documents: SerializedDocument[];
}) {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [previewDoc, setPreviewDoc] = useState<SerializedDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (documents.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {t("noDocuments")}
      </p>
    );
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await deleteDocument(deleteId);
    toast.success(t("deleted"));
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => {
          const Icon = getFileIcon(doc.fileType);
          return (
            <Card key={doc.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {doc.fileName}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>
                      {format(new Date(doc.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                    {doc.person && <span>{doc.person.fullName}</span>}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t(`categories.${doc.category}`)}
                </Badge>
                <div className="flex gap-1 shrink-0">
                  {(doc.fileType.startsWith("image/") ||
                    doc.fileType === "application/pdf" ||
                    doc.fileType.startsWith("audio/")) && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      window.open(`/api/files/${doc.id}`, "_blank");
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            {previewDoc?.fileType.startsWith("image/") && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`/api/files/${previewDoc.id}`}
                alt={previewDoc.fileName}
                className="max-w-full h-auto rounded"
              />
            )}
            {previewDoc?.fileType === "application/pdf" && (
              <iframe
                src={`/api/files/${previewDoc.id}`}
                className="w-full h-[60vh] rounded"
              />
            )}
            {previewDoc?.fileType.startsWith("audio/") && (
              <audio
                controls
                className="w-full"
                src={`/api/files/${previewDoc.id}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCommon("confirm")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "..." : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
