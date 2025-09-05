"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Notice() {
  const search = useSearchParams();
  const msg = search.get("msg");
  const [open, setOpen] = useState(true);

  if (!msg || !open) return null;

  let text = "";
  if (msg === "login-cancelled") {
    text = "Login blev annulleret. Prøv igen, når du er klar.";
  } else {
    // ukendte beskeder skjuler vi bare – eller du kan vise msg-teksten
    return null;
  }

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e5e5e5",
        background: "#f8f8f8",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
      role="status"
      aria-live="polite"
    >
      <span>{text}</span>
      <button
        onClick={() => setOpen(false)}
        aria-label="Luk besked"
        style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }}
      >
        ✕
      </button>
    </div>
  );
}