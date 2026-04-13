"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, FormInput, FormLabel, FormSelect } from "@codelittinc/backstage-design-system";
import { toast } from "@codelittinc/backstage-design-system";
import { Upload, X } from "lucide-react";

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

  const categoryOptions = (
    ["exam", "prescription", "recording", "report", "other"] as const
  ).map((cat) => ({ value: cat, label: t(`categories.${cat}`) }));

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-primary/50"
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
            <span className="text-xs text-gray-500">
              ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500">{t("dragDrop")}</p>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <FormLabel className="text-xs">{t("category")}</FormLabel>
              <FormSelect
                value={category}
                onChange={(v) => setCategory(v ?? "other")}
                options={categoryOptions}
              />
            </div>
            <div className="space-y-1">
              <FormLabel className="text-xs">{t("description")}</FormLabel>
              <FormInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description")}
              />
            </div>
          </div>
          <Button variant="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? "..." : t("upload")}
          </Button>
        </div>
      )}
    </div>
  );
}
