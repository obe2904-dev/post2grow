"use client";

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabaseClient";

export default function Page() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase().auth.getSession();
      if (data.session) {
        // Allerede logget ind → direkte til app
        window.location.href = "/da/app";
        return;
      }
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <main>
        <Header />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
          Loader…
        </div>
      </main>
    );
  }

  // (Din eksisterende magic-link UI herunder – uændret)
  return (
    <main>
      <Header />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Login</h1>
        {/* behold resten af din login-form fra før */}
      </div>
    </main>
  );
}