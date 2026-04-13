"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useTranslations } from "next-intl";
import { updateAppointmentNotes } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";
import { toast } from "sonner";

interface ClinicalNotesEditorProps {
  appointmentId: string;
  initialContent?: unknown;
}

export function ClinicalNotesEditor({
  appointmentId,
  initialContent,
}: ClinicalNotesEditorProps) {
  const t = useTranslations("appointments");
  const tCommon = useTranslations("common");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("notes") + "...",
      }),
    ],
    immediatelyRender: false,
    content: (initialContent as Record<string, unknown>) ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(editor.getJSON());
      }, 2000);
    },
  });

  const handleSave = useCallback(
    async (content: unknown) => {
      await updateAppointmentNotes(appointmentId, content);
    },
    [appointmentId]
  );

  const handleManualSave = useCallback(async () => {
    if (!editor) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await updateAppointmentNotes(appointmentId, editor.getJSON());
    toast.success(t("updated"));
  }, [editor, appointmentId, t]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 border-b pb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          data-active={editor.isActive("heading", { level: 2 }) || undefined}
          className="data-[active]:bg-muted"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold") || undefined}
          className="data-[active]:bg-muted"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic") || undefined}
          className="data-[active]:bg-muted"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList") || undefined}
          className="data-[active]:bg-muted"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList") || undefined}
          className="data-[active]:bg-muted"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualSave}
        >
          {tCommon("save")}
        </Button>
      </div>
      <div className="rounded-lg border">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
