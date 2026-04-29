import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Pin, PinOff, Palette, Trash2, AlignLeft, AlignCenter,
  AlignRight, Strikethrough, Quote, Minus,
} from "lucide-react";
import { Note, NoteColor, NOTE_COLORS } from "./NotesSidebar";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onToggleSidebar: () => void;
}

const TOOLBAR_GROUPS = [
  [
    { cmd: "bold",          icon: Bold,           title: "Bold (⌘B)" },
    { cmd: "italic",        icon: Italic,         title: "Italic (⌘I)" },
    { cmd: "underline",     icon: Underline,      title: "Underline (⌘U)" },
    { cmd: "strikeThrough", icon: Strikethrough,  title: "Strikethrough" },
  ],
  [
    { cmd: "insertUnorderedList", icon: List,          title: "Bullet list" },
    { cmd: "insertOrderedList",   icon: ListOrdered,   title: "Numbered list" },
    { cmd: "formatBlock_blockquote", icon: Quote,       title: "Blockquote" },
    { cmd: "insertHorizontalRule", icon: Minus,        title: "Divider" },
  ],
  [
    { cmd: "justifyLeft",   icon: AlignLeft,      title: "Align left" },
    { cmd: "justifyCenter", icon: AlignCenter,    title: "Align center" },
    { cmd: "justifyRight",  icon: AlignRight,     title: "Align right" },
  ],
];

export function NoteEditor({ note, onUpdate, onDelete, onToggleSidebar }: NoteEditorProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Sync content to editor when note changes
  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerHTML !== note.content) {
      bodyRef.current.innerHTML = note.content;
    }
  }, [note.id]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [note.title]);

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const execCmd = useCallback((cmd: string, value?: string) => {
    if (cmd.startsWith("formatBlock_")) {
      document.execCommand("formatBlock", false, cmd.split("_")[1]);
    } else {
      document.execCommand(cmd, false, value);
    }
    bodyRef.current?.focus();
    saveContent();
  }, []);

  const saveContent = useCallback(() => {
    if (bodyRef.current) {
      onUpdate(note.id, { content: bodyRef.current.innerHTML });
    }
  }, [note.id, onUpdate]);

  const colorCfg = NOTE_COLORS[note.color];

  const wordCount = note.content
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: colorCfg.bg, fontFamily: "'Lato', sans-serif" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
      >
        {/* Mobile menu + title */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden flex flex-col gap-1 p-1"
            onClick={onToggleSidebar}
            aria-label="Open sidebar"
          >
            <span className="block rounded" style={{ width: 18, height: 2, background: "#6B3A2A" }} />
            <span className="block rounded" style={{ width: 14, height: 2, background: "#6B3A2A" }} />
            <span className="block rounded" style={{ width: 18, height: 2, background: "#6B3A2A" }} />
          </button>
          <span style={{ fontSize: 12, color: "#BBA890", fontFamily: "'Lato', sans-serif" }}>
            {note.updatedAt.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            &nbsp;·&nbsp;
            {note.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Color picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              className="flex items-center justify-center rounded-lg p-2 transition-colors"
              style={{ color: "#7A5C4A" }}
              title="Note color"
              onClick={() => setShowColorPicker((v) => !v)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Palette size={16} />
            </button>
            {showColorPicker && (
              <div
                className="absolute right-0 top-10 rounded-2xl p-3 z-50 flex gap-2 shadow-lg"
                style={{ background: "#FDF8F0", border: "1px solid #E2D5BE" }}
              >
                {(Object.entries(NOTE_COLORS) as [NoteColor, typeof NOTE_COLORS[NoteColor]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    title={cfg.label}
                    className="rounded-full transition-transform hover:scale-110 active:scale-95"
                    style={{
                      width: 24,
                      height: 24,
                      background: cfg.dot,
                      outline: note.color === key ? `2px solid #6B3A2A` : "none",
                      outlineOffset: 2,
                    }}
                    onClick={() => { onUpdate(note.id, { color: key }); setShowColorPicker(false); }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pin */}
          <button
            className="flex items-center justify-center rounded-lg p-2 transition-colors"
            style={{ color: note.pinned ? "#C4874A" : "#7A5C4A" }}
            title={note.pinned ? "Unpin" : "Pin note"}
            onClick={() => onUpdate(note.id, { pinned: !note.pinned })}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {note.pinned ? <Pin size={16} fill="#C4874A" /> : <PinOff size={16} />}
          </button>

          {/* Delete */}
          <button
            className="flex items-center justify-center rounded-lg p-2 transition-colors"
            style={{ color: "#C4874A" }}
            title="Delete note"
            onClick={() => onDelete(note.id)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,135,74,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      <div
        className="flex items-center flex-wrap gap-0.5 px-4 md:px-6 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
      >
        {TOOLBAR_GROUPS.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.map(({ cmd, icon: Icon, title }) => (
              <button
                key={cmd}
                title={title}
                onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
                className="flex items-center justify-center rounded-lg transition-all duration-100 active:scale-90"
                style={{ width: 30, height: 30, color: "#5A3E2B" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,58,42,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Icon size={14} />
              </button>
            ))}
            {gi < TOOLBAR_GROUPS.length - 1 && (
              <div style={{ width: 1, height: 20, background: "#E2D5BE", margin: "0 4px" }} />
            )}
          </React.Fragment>
        ))}

        {/* Font size */}
        <div style={{ width: 1, height: 20, background: "#E2D5BE", margin: "0 4px" }} />
        {[
          { label: "H1", cmd: "formatBlock", val: "h1" },
          { label: "H2", cmd: "formatBlock", val: "h2" },
          { label: "P",  cmd: "formatBlock", val: "p"  },
        ].map(({ label, cmd, val }) => (
          <button
            key={val}
            title={label}
            onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd, false, val); bodyRef.current?.focus(); saveContent(); }}
            className="flex items-center justify-center rounded-lg transition-all duration-100 active:scale-90"
            style={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, color: "#5A3E2B", fontFamily: "'Lato', sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,58,42,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Note content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-8">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={note.title}
            onChange={(e) => onUpdate(note.id, { title: e.target.value })}
            placeholder="Untitled"
            rows={1}
            className="w-full bg-transparent resize-none outline-none"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 30,
              fontWeight: 600,
              color: "#2C1810",
              lineHeight: 1.3,
              marginBottom: 8,
              overflow: "hidden",
            }}
          />

          {/* Divider with coffee ring */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{ flex: 1, height: 1, background: "rgba(107,58,42,0.15)" }} />
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 22, height: 22,
                border: "2px solid rgba(107,58,42,0.2)",
                boxShadow: "inset 0 0 0 2px rgba(107,58,42,0.07)",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(107,58,42,0.2)" }} />
            </div>
            <div style={{ flex: 1, height: 1, background: "rgba(107,58,42,0.15)" }} />
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            onInput={saveContent}
            onBlur={saveContent}
            data-placeholder="Start writing your note…"
            className="outline-none min-h-64"
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              color: "#3D2314",
              lineHeight: 1.85,
            }}
          />
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="flex items-center justify-between px-6 py-2 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        <span style={{ fontSize: 11, color: "#BBA890" }}>
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{ width: 7, height: 7, background: colorCfg.dot }}
          />
          <span style={{ fontSize: 11, color: "#BBA890" }}>{colorCfg.label}</span>
        </div>
      </div>

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #C4A882;
          pointer-events: none;
          font-style: italic;
        }
        [contenteditable] h1 {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 600;
          color: #2C1810;
          margin: 16px 0 8px;
          line-height: 1.3;
        }
        [contenteditable] h2 {
          font-family: 'Playfair Display', serif;
          font-size: 19px;
          font-weight: 500;
          color: #2C1810;
          margin: 14px 0 6px;
          line-height: 1.3;
        }
        [contenteditable] blockquote {
          border-left: 3px solid #C4874A;
          padding-left: 14px;
          margin: 10px 0;
          color: #7A5C4A;
          font-style: italic;
        }
        [contenteditable] ul {
          list-style: disc;
          padding-left: 20px;
          margin: 6px 0;
        }
        [contenteditable] ol {
          list-style: decimal;
          padding-left: 20px;
          margin: 6px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 1px solid #E2D5BE;
          margin: 14px 0;
        }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
        [contenteditable] u { text-decoration: underline; }
        [contenteditable] s { text-decoration: line-through; }
      `}</style>
    </div>
  );
}
