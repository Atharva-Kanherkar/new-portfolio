"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";

export default function ClassicChat() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ac = "#FF6B35";

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#0a0a0a",
            border: `1px solid ${hovered ? ac : "#222"}`,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            letterSpacing: ".08em",
            textTransform: "uppercase" as const,
            color: hovered ? ac : "#666",
            transition: "color .2s, border-color .2s",
          }}
        >
          [ASK AI]
        </button>
      )}

      <ChatPanel
        isOpen={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        accentColor={ac}
      />
    </>
  );
}
