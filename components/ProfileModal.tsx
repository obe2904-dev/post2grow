"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  open: boolean;
  onClose: () => void;
  initialFirstName?: string;
  initialLastName?: string;
  onSaved?: (first: string, last: string) => void;
};

export default function ProfileModal({
  open,
  onClose,
  initialFirstName = "",
  initialLastName = "",
  onSaved,
}: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setSaving(false);
    setError(null);
  }, [open, initialFirstName, initialLastName]);

  // ESC luk
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const backdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) onClose();
  };

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase().auth.updateUser({
        data: { first_name: firstName, last_name: lastName },
      });
      if (error) throw error;
      onSaved?.(firstName, lastName);
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke gemme.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      ref={dialogRef}
      onClick={backdropClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
      role="dialog"
      aria-modal
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Fuldfør din profil</h2>
          <button onClick={onClose} aria-label="Luk" style={{ padding: 8, borderRadius: 8 }}>✕</button>
        </div>

        <p style={{ color: "#666", marginTop: 6 }}>
          Valgfrit: Du kan udfylde dit navn nu eller springe over og gøre det senere under <b>Indstillinger</b>.
        </p>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 14 }}>Fornavn</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginTop: 6 }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 14 }}>Efternavn</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, marginTop: 6 }}
          />
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          <button
            onClick={save}
            disabled={saving || !firstName || !lastName}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              background: "#000",
              color: "#fff",
              opacity: saving || !firstName || !lastName ? 0.7 : 1
            }}
          >
            {saving ? "Gemmer…" : "Gem"}
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              background: "#f5f5f5",
              color: "#333",
              border: "1px solid #e5e5e5"
            }}
          >
            Spring over – udfyld senere
          </button>
        </div>

        {error && <p style={{ marginTop: 10, color: "#c00" }}>{error}</p>}
      </div>
    </div>
  );
}