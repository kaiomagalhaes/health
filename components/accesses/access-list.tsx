"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteAccess } from "@/actions/accesses";
import type { SerializedAccess } from "@/actions/accesses";
import { Card, Button, EmptyState } from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Globe,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Pencil,
  KeyRound,
} from "lucide-react";
import { AccessForm } from "./access-form";

export function AccessList({ accesses }: { accesses: SerializedAccess[] }) {
  const t = useTranslations("accesses");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(
    new Set()
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingAccess, setEditingAccess] = useState<SerializedAccess | null>(
    null
  );

  function togglePassword(id: string) {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success(t("copied"));
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await deleteAccess(deleteId);
    toast.success(t("deleted"));
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  if (accesses.length === 0) {
    return (
      <EmptyState
        message={t("noAccesses")}
        icon={<KeyRound className="h-8 w-8" />}
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {accesses.map((access) => (
          <Card key={access.id}>
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    {access.description && (
                      <p className="text-sm font-medium truncate">
                        {access.description}
                      </p>
                    )}
                    <a
                      href={access.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate block"
                    >
                      {access.websiteUrl}
                    </a>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    className="p-1.5 rounded hover:bg-gray-100"
                    onClick={() => window.open(access.websiteUrl, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100"
                    onClick={() => setEditingAccess(access)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100"
                    onClick={() => setDeleteId(access.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 w-12">
                    {t("login")}:
                  </span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate">
                    {access.login}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(access.login)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 w-12">
                    {t("password")}:
                  </span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded truncate">
                    {visiblePasswords.has(access.id)
                      ? access.password
                      : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  </code>
                  <button
                    type="button"
                    onClick={() => togglePassword(access.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {visiblePasswords.has(access.id) ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(access.password)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAccess}
        onOpenChange={(open) => !open && setEditingAccess(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAccess")}</DialogTitle>
          </DialogHeader>
          {editingAccess && (
            <AccessForm
              personId={editingAccess.personId}
              appointmentId={editingAccess.appointmentId}
              access={editingAccess}
              onSaved={() => setEditingAccess(null)}
            />
          )}
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
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "..." : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
