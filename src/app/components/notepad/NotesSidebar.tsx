import React, { useState } from "react";
import { Search, Plus, Pin, Coffee, BookOpen, Trash2, X } from "lucide-react";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export type NoteColor = "cream" | "espresso" | "caramel" | "matcha" | "blush";

export const NOTE_COLORS: Record<NoteColor, { bg: string; sidebar: string; label: string; dot: string }> = {
  cream:    { bg: "#FFFDF8", sidebar: "#F9F5EC", label: "Cream",    dot: "#E2C99A" },
  espresso: { bg: "#FDF0E3", sidebar: "#F5E6D3", label: "Espresso", dot: "#C4874A" },
  caramel:  { bg: "#FFF8EC", sidebar: "#F9EDD0", label: "Caramel",  dot: "#D4A827" },
  matcha:   { bg: "#F3F9F0", sidebar: "#E6F2E2", label: "Matcha",   dot: "#7CAE6E" },
  blush:    { bg: "#FDF3F5", sidebar: "#F5E5E9", label: "Blush",    dot: "#D4819A" },
};

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  onDeleteNote: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  isOpen,
  onClose,
}: NotesSidebarProps) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = notes
    .filter((n) => {
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.replace(/<[^>]*>/g, "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(44, 24, 16, 0.3)" }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed md:relative z-30 md:z-auto top-0 left-0 h-full flex flex-col transition-transform duration-300 md:translate-x-0"
        style={{
          width: "280px",
          background: "#F5EDD8",
          borderRight: "1px solid #E2D5BE",
          transform: isOpen ? "translateX(0)" : undefined,
          fontFamily: "'Lato', sans-serif",
        }}
        data-sidebar-open={isOpen}
      >
        {/* Logo header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #E2D5BE" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 36, height: 36, background: "#6B3A2A" }}
            >
              <Coffee size={18} color="#F5EDD8" />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#2C1810", lineHeight: 1.2 }}>
                BrewNotes
              </div>
              <div style={{ fontSize: 10, color: "#9C7B6B", letterSpacing: "0.08em" }}>YOUR DAILY BLEND</div>
            </div>
          </div>
          <button
            className="md:hidden flex items-center justify-center rounded-lg p-1"
            style={{ color: "#7A5C4A" }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* New note button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onNewNote}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all duration-150 active:scale-95"
            style={{
              background: "#6B3A2A",
              color: "#FDF8F0",
              fontSize: 14,
              fontFamily: "'Lato', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#8B4E38")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#6B3A2A")}
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#EFE4CC", border: "1px solid #E2D5BE" }}
          >
            <Search size={14} style={{ color: "#9C7B6B" }} />
            <input
              type="text"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 13, color: "#2C1810", fontFamily: "'Lato', sans-serif" }}
            />
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-3 py-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#D9C9B0 transparent" }}>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <BookOpen size={32} style={{ color: "#C4A882" }} />
              <p style={{ fontSize: 13, color: "#9C7B6B", textAlign: "center" }}>
                {search ? "No notes found" : "No notes yet.\nClick + to begin."}
              </p>
            </div>
          )}

          {filtered.map((note) => {
            const isActive = note.id === activeNoteId;
            const isHovered = note.id === hoveredId;
            const preview = stripHtml(note.content).slice(0, 80) || "Empty note…";
            const colorCfg = NOTE_COLORS[note.color];

            return (
              <div
                key={note.id}
                className="relative rounded-xl mb-1.5 px-3 py-3 cursor-pointer transition-all duration-150"
                style={{
                  background: isActive ? colorCfg.sidebar : isHovered ? "#EFE4CC" : "transparent",
                  borderLeft: isActive ? `3px solid #6B3A2A` : "3px solid transparent",
                }}
                onClick={() => { onSelectNote(note.id); onClose(); }}
                onMouseEnter={() => setHoveredId(note.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-start justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {note.pinned && <Pin size={10} style={{ color: "#C4874A", flexShrink: 0 }} fill="#C4874A" />}
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        color: "#2C1810",
                      }}
                    >
                      {note.title || "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className="rounded-full"
                      style={{ width: 7, height: 7, background: colorCfg.dot, flexShrink: 0 }}
                    />
                    {isHovered && (
                      <button
                        className="rounded p-0.5 transition-colors"
                        style={{ color: "#C4874A" }}
                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#A0522D")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#C4874A")}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="truncate" style={{ fontSize: 12, color: "#9C7B6B", fontFamily: "'Lato', sans-serif" }}>
                  {preview}
                </p>
                <p style={{ fontSize: 10, color: "#BBA890", marginTop: 3, fontFamily: "'Lato', sans-serif" }}>
                  {formatDate(note.updatedAt)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid #E2D5BE" }}
        >
          <span style={{ fontSize: 11, color: "#BBA890", fontFamily: "'Lato', sans-serif" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 11, color: "#BBA890", fontFamily: "'Lato', sans-serif" }}>☕ BrewNotes</span>
        </div>
      </aside>

      {/* Mobile sidebar hidden by default – controlled via transform */}
      <style>{`
        @media (max-width: 767px) {
          [data-sidebar-open="false"] {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
}
