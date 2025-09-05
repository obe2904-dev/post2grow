"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

type UserMeta = {
  first_name?: string;
  last_name?: string;
};

export default function Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase().auth.getUser();
      const user = data.user;
      if (!user) {
        setLoading(false);
        return;
      }
      setEmail(user.email ?? null);
      const meta = (user.user_metadata ?? {}) as UserMeta;
      if (meta.first_name) setFirstName(meta.first_name);
      if (meta.last_name) setLastName(meta.last_name);
      setLoading(false);
    })();
  }, []);

  async function saveNames() {
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase().auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      if (error) throw error;
      setSaved(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunne ikke gemme.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={{ padding: 20 }}>Loader…</main>;

  if (!email) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Ikke logget ind</h1>
        <p><a href="/da/login">Gå til login</a></p>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 560 }}>
      <h1 style={{ marginBottom: 10 }}>Velkommen</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Du er logget ind som <b>{email}</b>.
      </p>

      <div style={{ marginTop: 16 }}>
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

      <button
        onClick={saveNames}
        disabled={saving}
        style={{ marginTop: 14, width: "100%", padding: "10px 12px", borderRadius: 8, background: "#000", color: "#fff", opacity: saving ? 0.7 : 1 }}
      >
        {saving ? "Gemmer…" : "Gem og fortsæt"}
      </button>

      {saved && <p style={{ marginTop: 10, color: "#0a7" }}>Gemt! ✅</p>}
      {error && <p style={{ marginTop: 10, color: "#c00" }}>{error}</p>}
    </main>
  );
}