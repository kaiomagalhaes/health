"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  updateAppointmentStatus,
  deleteAppointment,
} from "@/actions/appointments";
import { Button, FormSelect } from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppointmentStatus } from "@/types";
import { Trash2 } from "lucide-react";

export function AppointmentStatusSelect({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: AppointmentStatus;
}) {
  const t = useTranslations("appointments");
  const [status, setStatus] = useState(currentStatus);

  const statusOptions = ["scheduled", "in_progress", "completed", "cancelled"].map(
    (s) => ({ value: s, label: t(`statuses.${s}`) })
  );

  async function handleChange(value: string | null) {
    if (!value) return;
    const s = value as AppointmentStatus;
    setStatus(s);
    await updateAppointmentStatus(appointmentId, s);
    toast.success(t("updated"));
  }

  return (
    <FormSelect
      value={status}
      onChange={handleChange}
      options={statusOptions}
    />
  );
}

export function DeleteAppointmentButton({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteAppointment(appointmentId);
    toast.success(t("deleted"));
    router.push("/appointments");
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 mr-1" />
        {tCommon("delete")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tCommon("confirm")}</DialogTitle>
            <DialogDescription>{t("confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              {loading ? "..." : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
