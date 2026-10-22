"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type MarkdownStorage = { markdown: { getMarkdown: () => string } };

function getMarkdown(editor: Editor) {
  return (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown();
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Link URL", previous ?? "https://");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    toast.error("Links must start with http:// or https://");
    return;
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
}

type ToolbarItem = {
  label: string;
  icon: LucideIcon;
  run: () => void;
  active?: boolean;
  disabled?: boolean;
};

function Toolbar({ editor }: { editor: Editor }) {
  const items: ToolbarItem[] = [
    {
      label: "Bold",
      icon: Bold,
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: Italic,
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: Heading3,
      active: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullet list",
      icon: List,
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      icon: Quote,
      active: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code block",
      icon: Code,
      active: editor.isActive("codeBlock"),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "Link",
      icon: Link2,
      active: editor.isActive("link"),
      run: () => setLink(editor),
    },
    {
      label: "Undo",
      icon: Undo2,
      disabled: !editor.can().undo(),
      run: () => editor.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      disabled: !editor.can().redo(),
      run: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-1">
      {items.map(({ label, icon: Icon, active, disabled, run }) => (
        <Button
          key={label}
          type="button"
          variant={active ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8"
          aria-label={label}
          title={label}
          disabled={disabled}
          onClick={run}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the notes for this section...",
}: {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        linkify: true,
        transformPastedText: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor: updatedEditor }) => onChange(getMarkdown(updatedEditor)),
  });

  if (!editor) {
    return <div className="h-[380px] animate-pulse rounded-xl border bg-muted" />;
  }

  return (
    <div className="rounded-xl border bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
