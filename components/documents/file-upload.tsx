"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  personId: string;
  appointmentId?: string;
  onUploaded?: () => void;
}

export function FileUpload({
  personId,
  appointmentId,
  onUploaded,
}: FileUploadProps) {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(files: FileList | null) {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("personId", personId);
    if (appointmentId) formData.append("appointmentId", appointmentId);
    formData.append("category", category);
    if (description) formData.append("description", description);

    try {
      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success(t("uploaded"));
      setFile(null);
      setDescription("");
      setCategory("other");
      router.refresh();
      onUploaded?.();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileChange(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav,audio/mp4,audio/x-m4a"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium truncate max-w-xs">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("dragDrop")}</p>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("category")}</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v ?? "other")}
              >
                <SelectTrigger>
                  <SelectValue>{t(`categories.${category}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(
                    ["exam", "prescription", "recording", "report", "other"] as const
                  ).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("description")}</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description")}
              />
            </div>
          </div>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "..." : t("upload")}
          </Button>
        </div>
      )}
    </div>
  );
}
