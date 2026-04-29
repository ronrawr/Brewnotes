import React from "react";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onNewNote: () => void;
  onToggleSidebar: () => void;
  coffeeImgUrl: string;
}

export function EmptyState({ onNewNote, onToggleSidebar, coffeeImgUrl }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6"
      style={{ background: "#FBF5EB", fontFamily: "'Lato', sans-serif" }}
    >
      {/* Mobile menu button */}
      <button
        className="md:hidden absolute top-4 left-4 flex flex-col gap-1 p-1"
        onClick={onToggleSidebar}
        aria-label="Open sidebar"
      >
        <span className="block rounded" style={{ width: 18, height: 2, background: "#6B3A2A" }} />
        <span className="block rounded" style={{ width: 14, height: 2, background: "#6B3A2A" }} />
        <span className="block rounded" style={{ width: 18, height: 2, background: "#6B3A2A" }} />
      </button>

      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Coffee image with decorative ring */}
        <div className="relative">
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 140,
              height: 140,
              border: "4px solid #E2D5BE",
              boxShadow: "0 8px 32px rgba(107,58,42,0.15)",
            }}
          >
            <img
              src={coffeeImgUrl}
              alt="Coffee"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative ring */}
          <div
            className="absolute -bottom-3 -right-3 rounded-full"
            style={{
              width: 50,
              height: 50,
              border: "3px solid #C4874A",
              opacity: 0.4,
            }}
          />
          <div
            className="absolute -top-2 -left-2 rounded-full"
            style={{
              width: 30,
              height: 30,
              border: "2px solid #D4A827",
              opacity: 0.3,
            }}
          />
        </div>

        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 600,
              color: "#2C1810",
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            Your canvas awaits
          </h2>
          <p style={{ fontSize: 14, color: "#9C7B6B", lineHeight: 1.7 }}>
            Select a note from the sidebar, or brew a fresh one. Ideas taste better when written down.
          </p>
        </div>

        <button
          onClick={onNewNote}
          className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-150 active:scale-95"
          style={{
            background: "#6B3A2A",
            color: "#FDF8F0",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#8B4E38")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#6B3A2A")}
        >
          <Plus size={16} />
          New Note
        </button>

        {/* Decorative dots */}
        <div className="flex gap-2 mt-2">
          {["#C4874A", "#D4A827", "#7CAE6E", "#D4819A"].map((c, i) => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: c, opacity: 0.5 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
