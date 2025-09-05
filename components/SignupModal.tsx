"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = { open: boolean; onClose: () => void };
type Mode = "choose" | "email"; // step 1 (valg) → step 2 (indtast e-mail)

export default function SignupModal({ open, onClose }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false); // frivillig tilmelding
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Reset når modal åbner/lukker
  useEffect(() => {
    if (!open) return;
    setAccepted(false);
    setMarketingOptIn(false);
    setMode("choose");
    setEmail("");
    setSending(false);
    setSent(false);
    setError(null);
  }, [open]);

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

  function rememberConsentsInLocalStorage() {
    try {
      localStorage.setItem("p2g_accept_terms", "1");
      localStorage.setItem("p2g_marketing_optin", marketingOptIn ? "1" : "0");
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }

  async function handleGoogle() {
    if (!accepted) return;
    try {
      rememberConsentsInLocalStorage();
      await supabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/da/app` },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke starte Google-login.";
      alert(msg);
    }
  }

  async function sendMagicLink() {
    if (!accepted || !email) return;
    setSending(true);
    setError(null);
    try {
      rememberConsentsInLocalStorage();
      const { error } = await supabase().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/da/app` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke sende magic link.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  const btn = (enabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.5,
  });

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
      aria-modal
      role="dialog"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          color: "#111",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Kom i gang helt gratis</h2>
            <p style={{ marginTop: 4, color: "#666" }}>Ingen binding. Ingen betalingskort påkrævet.</p>
          </div>
          <button onClick={onClose} aria-label="Luk" style={{ padding: 8, borderRadius: 8 }}>✕</button>
        </div>

        {/* Obligatorisk accept */}
        <label style={{ display: "flex", gap: 10, marginTop: 12, fontSize: 14, alignItems: "start" }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span>
            Jeg accepterer{" "}
            <a href="/da/betingelser" style={{ textDecoration: "underline" }} target="_blank" rel="noreferrer">
              Betingelser
            </a>{" "}
            og{" "}
            <a href="/da/databehandleraftale" style={{ textDecoration: "underline" }} target="_blank" rel="noreferrer">
              Databehandleraftale
            </a>
            .
          </span>
        </label>

        {/* Frivillig tilmelding */}
        <label style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 14, alignItems: "start" }}>
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            style={{ marginTop: 4 }}
          />
          <span>
            Ja tak – tilmeld mig mails med vigtige informationer og tips til brugen af Post2Grow.
            Du kan altid afmelde igen.
          </span>
        </label>

        {mode === "choose" && (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <button
              disabled={!accepted}
              onClick={handleGoogle}
              style={{ ...btn(accepted), border: "1px solid #ddd", background: "#fff", color: "#111" }}
            >
              Opret med Google
            </button>

            <button
              disabled={!accepted}
              onClick={() => accepted && setMode("email")}
              style={{ ...btn(accepted), border: "none", background: "#000", color: "#fff" }}
            >
              Opret med e-mail
            </button>
          </div>
        )}

        {mode === "email" && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 14 }}>E-mail</label>
            <input
              type="email"
              placeholder="din@mail.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
                marginTop: 6,
                color: "#111",
                background: "#fff",
              }}
            />

            <button
              disabled={!accepted || !email || sending}
              onClick={sendMagicLink}
              style={{ ...btn(!!accepted && !!email && !sending), marginTop: 10, border: "none", background: "#000", color: "#fff" }}
            >
              {sending ? "Sender…" : "Send magic link"}
            </button>

            {sent && <p style={{ marginTop: 10, color: "#0a7" }}>Tjek din indbakke (evt. spam/uønsket).</p>}
            {error && <p style={{ marginTop: 10, color: "#c00" }}>{error}</p>}

            <div style={{ marginTop: 10, fontSize: 14 }}>
              <button
                onClick={() => setMode("choose")}
                style={{ textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#111" }}
              >
                ← Tilbage
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 14 }}>
          Har du allerede en konto?{" "}
          <a href="/da/login" style={{ textDecoration: "underline" }}>
            Login her
          </a>
        </div>
      </div>
    </div>
  );
}