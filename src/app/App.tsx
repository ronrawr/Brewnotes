import React, { useState, useCallback, useEffect } from "react";
import { NotesSidebar, Note, NoteColor } from "./components/notepad/NotesSidebar";
import { NoteEditor } from "./components/notepad/NoteEditor";
import { EmptyState } from "./components/notepad/EmptyState";

const COFFEE_IMG = "https://images.unsplash.com/photo-1772187498604-0695d22fe4e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBsYXR0ZSUyMGFydCUyMHdhcm0lMjBjb3p5fGVufDF8fHx8MTc3NzQ3MDMyM3ww&ixlib=rb-4.1.0&q=80&w=1080";

const STORAGE_KEY = "brewnotes_notes";
const ACTIVE_KEY = "brewnotes_active";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: makeId(),
    title: "",
    content: "",
    color: "cream" as NoteColor,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    ...overrides,
  };
}

const SEED_NOTES: Note[] = [
  createNote({
    id: "seed-1",
    title: "Welcome to BrewNotes ☕",
    content: `<p>Every great idea starts with a good cup of coffee — and a place to write it down.</p><p><br></p><p><strong>BrewNotes</strong> is your cozy corner for capturing thoughts, ideas, and inspiration.</p><p><br></p><h2>Getting started</h2><ul><li>Create a new note with the <strong>+ New Note</strong> button</li><li>Format text using the toolbar above</li><li>Pin important notes so they stay at the top</li><li>Change note color with the palette icon</li></ul>`,
    color: "espresso",
    pinned: true,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  }),
  createNote({
    id: "seed-2",
    title: "Morning thoughts",
    content: `<p>The best ideas come with the first sip of the day.</p><p><br></p><blockquote>Write. Sip. Repeat.</blockquote><p><br></p><p>Today I want to focus on things that matter — not just the urgent, but the <em>important</em>.</p>`,
    color: "caramel",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  }),
  createNote({
    id: "seed-3",
    title: "Reading list",
    content: `<ol><li>The Art of Thinking Clearly</li><li>Atomic Habits</li><li>Deep Work</li><li>The Pragmatic Programmer</li></ol>`,
    color: "matcha",
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  }),
];

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_NOTES;
    const parsed = JSON.parse(raw);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
    }));
  } catch {
    return SEED_NOTES;
  }
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const saved = localStorage.getItem(ACTIVE_KEY);
    return saved || SEED_NOTES[0].id;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist active note
  useEffect(() => {
    if (activeNoteId) localStorage.setItem(ACTIVE_KEY, activeNoteId);
  }, [activeNoteId]);

  const handleNewNote = useCallback(() => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    setActiveNoteId(note.id);
    setSidebarOpen(false);
  }, []);

  const handleSelectNote = useCallback((id: string) => {
    setActiveNoteId(id);
  }, []);

  const handleUpdateNote = useCallback((id: string, changes: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...changes, updatedAt: new Date() } : n
      )
    );
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  }, [activeNoteId]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#FBF5EB" }}
    >
      {/* Sidebar */}
      <NotesSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onDeleteNote={handleDeleteNote}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main editor area */}
      <main className="flex-1 overflow-hidden relative">
        {activeNote ? (
          <NoteEditor
            note={activeNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onToggleSidebar={() => setSidebarOpen(true)}
          />
        ) : (
          <EmptyState
            onNewNote={handleNewNote}
            onToggleSidebar={() => setSidebarOpen(true)}
            coffeeImgUrl={COFFEE_IMG}
          />
        )}
      </main>
    </div>
  );
}
