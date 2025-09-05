"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SignupModal from "./SignupModal";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null); // null = ved ikke endnu

  useEffect(() => {
    const client = supabase();

    // Tjek nuværende session
    client.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
    });

    // Lyt efter ændringer (login/logout)
    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  async function handleSignOut() {
    await supabase().auth.signOut();
    window.location.href = "/da/cafe";
  }

  return (
    <header style={{ width: "100%", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 40, background: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/da" style={{ fontWeight: 600 }}>Post2Grow</Link>

        <nav style={{ display: "flex", gap: 12 }}>
          {authed === null && (
            // Lidt neutral state mens vi tjekker session
            <span style={{ opacity: 0.6 }}>…</span>
          )}

          {authed === true && (
            <>
              <Link href="/da/app">Gå til app</Link>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: "#000", color: "#fff", padding: "8px 12px", borderRadius: 8 }}
              >
                Log ud
              </button>
            </>
          )}

          {authed === false && (
            <>
              <Link href="/da/login">Login</Link>
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{ background: "#000", color: "#fff", padding: "8px 12px", borderRadius: 8 }}
              >
                Opret konto
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Modal */}
      <SignupModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}