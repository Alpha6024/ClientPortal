import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";

const ToolBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`px-2 py-1 rounded text-xs font-medium transition ${active ? "bg-cyan-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
  >
    {children}
  </button>
);

export default function RichEditor({ value, onChange, placeholder = "Start writing..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none text-gray-700",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const e = editor;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-100 bg-gray-50">
        <ToolBtn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")} title="Bold">B</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")} title="Italic"><em>I</em></ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")} title="Underline"><u>U</u></ToolBtn>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolBtn onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()} active={e.isActive("heading", { level: 1 })} title="H1">H1</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive("heading", { level: 2 })} title="H2">H2</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive("heading", { level: 3 })} title="H3">H3</ToolBtn>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolBtn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")} title="Bullet List">• List</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")} title="Numbered List">1. List</ToolBtn>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolBtn onClick={() => e.chain().focus().setTextAlign("left").run()} active={e.isActive({ textAlign: "left" })} title="Align Left">⬅</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().setTextAlign("center").run()} active={e.isActive({ textAlign: "center" })} title="Center">⬛</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().setTextAlign("right").run()} active={e.isActive({ textAlign: "right" })} title="Align Right">➡</ToolBtn>
        <div className="w-px bg-gray-200 mx-1" />
        <ToolBtn onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive("blockquote")} title="Quote">"</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().setHorizontalRule().run()} active={false} title="Divider">—</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().undo().run()} active={false} title="Undo">↩</ToolBtn>
        <ToolBtn onClick={() => e.chain().focus().redo().run()} active={false} title="Redo">↪</ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
