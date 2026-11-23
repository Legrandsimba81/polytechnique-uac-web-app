"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Link as LinkIcon,
  ImagePlus,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function TiptapEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: "Rédigez votre article…" }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const input = document.getElementById(
        `hidden-${name}`
      ) as HTMLInputElement | null;
      if (input) input.value = editor.getHTML();
    };
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor, name]);

  if (!editor) return null;

  async function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      alert("Échec de l'upload");
      return;
    }
    const { url } = await res.json();
    editor.chain().focus().setImage({ src: url }).run();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const ToolbarBtn = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8"
    >
      {children}
    </Button>
  );

  return (
    <div className="rounded-lg border bg-background">
      <input type="hidden" id={`hidden-${name}`} name={name} />

      <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolbarBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Lien"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Retirer le lien"
          >
            <Unlink className="h-4 w-4" />
          </ToolbarBtn>
        )}
        <ToolbarBtn
          onClick={() => fileInputRef.current?.click()}
          title="Insérer une image"
        >
          <ImagePlus className="h-4 w-4" />
        </ToolbarBtn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageUpload}
        />

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}