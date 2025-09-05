"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import ProfileModal from "./ProfileModal";
import { getOrCreateDefaultOrg, type Org } from "../lib/org";

type Props = { children: React.ReactNode };

type UserMeta = {
  first_name?: string;
  last_name?: string;
  accepted_terms_at?: string;
  terms_version?: string;
  marketing_opt_in?: boolean;
  plan?: "Gratis" | "Standard+" | "Premium" | string;
};

export default function AppShell({ children }: Props) {
  const [org, setOrg] = useState<Org | null>(null);
  const [orgReady, setOrgReady] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [plan, setPlan] = useState<string>("Gratis");
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [appError, setAppError] = useState<string | null>(null); // <-- NY

  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams?.get("error");

  // 1) Håndter OAuth-fejl (fx "Cancel") uden flicker → tilbage til /da/cafe
  useEffect(() => {
    if (!oauthError) return;
    (async () => {
      await supabase().auth.signOut();
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      router.replace("/da/cafe?msg=login-cancelled");
    })();
  }, [oauthError, router]);

  // 2) Hoved-load: beskyt ruter, meta-opdateringer og sørg for at der findes en org
  useEffect(() => {
    if (oauthError) return; // vent, hvis vi er ved at redirecte pga. OAuth-fejl

    (async () => {
      try {
        const client = supabase();
        const { data } = await client.auth.getUser();
        const user = data.user;

        // ikke logget ind -> send til login
        if (!user) {
          window.location.href = "/da/login";
          return;
        }

        // Topbar: læs user metadata (vi holder det kompatibelt for nu)
        const meta = (user.user_metadata ?? {}) as UserMeta;
        const f = meta.first_name || "";
        const l = meta.last_name || "";
        setFirstName(f);
        setLastName(l);
        setPlan(meta.plan || "Gratis");

        // Anvend valg fra "Opret konto"-modal (terms/marketing) én gang
        const lsAccepted =
          typeof window !== "undefined" ? localStorage.getItem("p2g_accept_terms") : null;
        const lsMarketing =
          typeof window !== "undefined" ? localStorage.getItem("p2g_marketing_optin") : null;

        const updates: Record<string, unknown> = {};
        if (lsAccepted === "1" && !meta.accepted_terms_at) {
          updates.accepted_terms_at = new Date().toISOString();
          updates.terms_version = "1.0.0";
        }
        if (lsMarketing !== null && typeof meta.marketing_opt_in === "undefined") {
          updates.marketing_opt_in = lsMarketing === "1";
        }
        if (typeof meta.plan === "undefined") {
          updates.plan = "Gratis";
        }
        if (Object.keys(updates).length > 0) {
          const { error: updErr } = await client.auth.updateUser({ data: updates });
          if (updErr) throw updErr;
        }

        // ryd nøglerne så de ikke anvendes igen
        if (typeof window !== "undefined") {
          localStorage.removeItem("p2g_accept_terms");
          localStorage.removeItem("p2g_marketing_optin");
        }

        // Sørg for at der findes en org (opretter én hvis ikke)
        const orgFound = await getOrCreateDefaultOrg(client);
        setOrg(orgFound);
        setOrgReady(true);

        // Brug org-plan (sandheden bor på organization)
        setPlan(orgFound.plan || "Gratis");

        // Gem org i localStorage til hurtig adgang i formularer mv.
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("p2g_org_id", orgFound.id);
            localStorage.setItem("p2g_org_name", orgFound.name);
          } catch {
            /* ignore */
          }
        }

        // Åbn profil-modal kun hvis navn mangler, højst én gang pr. session
        const prompted =
          typeof window !== "undefined" ? sessionStorage.getItem("p2g_profile_prompted") : null;
        if ((!f || !l) && !prompted) {
          setShowProfileModal(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("p2g_profile_prompted", "1");
          }
        }

        setLoading(false);
      } catch (e: unknown) {
  // Lav læsbar fejltekst
  let msg = "Ukendt fejl";
  if (e && typeof e === "object") {
    // supabase/postgrest fejl har ofte disse felter:
    const maybe: any = e;
    const parts = [maybe.message, maybe.details, maybe.hint, maybe.code]
      .filter(Boolean)
      .map(String);
    if (parts.length) {
      msg = parts.join(" — ");
    } else {
      try {
        msg = JSON.stringify(e);
      } catch {
        msg = String(e);
      }
    }
  } else {
    msg = String(e);
  }
  console.error("AppShell init error:", e);
  setAppError(msg);
  setLoading(false);
  setOrgReady(true);
}
    })();
  }, [oauthError]);

  async function handleSignOut() {
    await supabase().auth.signOut();
    window.location.href = "/da/cafe";
  }

  // Undgå flicker mens vi håndterer OAuth-fejl
  if (oauthError) return null;

  const sidebarW = 220;

  // Hvis noget gik galt, vis en rolig fejl i UI
  if (appError) {
    return (
      <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Noget gik galt</h1>
        <p style={{ color: "#b00" }}>{appError}</p>
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => (window.location.href = "/da/cafe")}
            style={{ background: "#000", color: "#fff", padding: "8px 12px", borderRadius: 8 }}
          >
            Til forsiden
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ background: "#f5f5f5", border: "1px solid #e5e5e5", padding: "8px 12px", borderRadius: 8 }}
          >
            Prøv igen
          </button>
        </div>
      </main>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      {/* VENSTRE SØJLE */}
      <aside
        style={{
          width: sidebarW,
          borderRight: "1px solid #eee",
          padding: "16px 12px",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 16 }}>Post2Grow</div>
        <nav style={{ display: "grid", gap: 8 }}>
          <a href="/da/app/lav-opslag">Lav opslag</a>
          <a href="/da/app/kalender">Kalender</a>
          <a href="/da/app/opslag">Se alle opslag</a>
          <a href="/da/app/medie-galleri">Medie galleri</a>
          <a href="/da/app/virksomhedsprofil">Virksomhedsprofil</a>
          <a href="/da/app/performance">Performance</a>
          <a href="/da/app/seo-analyse">SEO Analyse</a>
          <a href="/da/app/opgrader" style={{ fontWeight: 600 }}>Opgrader</a>
        </nav>
      </aside>

      {/* HØJRE SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TOPBJÆLKE */}
<header
  style={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#fff",
    borderBottom: "1px solid #eee",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
    }}
  >
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <div>Velkommen {firstName || " "}</div>
      <div style={{ color: "#666" }}>·</div>
      <a href="/da/app/opgrader" title="Skift plan" style={{ textDecoration: "none" }}>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid #e5e5e5",
            background: "#f8f8f8",
            fontSize: 12,
          }}
        >
          Plan: {plan}
        </span>
      </a>
      {/* NYT: vis aktiv virksomhedsnavn (klik fører til Virksomhedsprofil) */}
      {org?.name && (
        <>
          <div style={{ color: "#666" }}>·</div>
          <a href="/da/app/virksomhedsprofil" style={{ textDecoration: "none" }} title="Virksomhedsprofil">
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: 999,
                border: "1px solid #e5e5e5",
                background: "#f8f8f8",
                fontSize: 12,
              }}
            >
              {org.name}
            </span>
          </a>
        </>
      )}
    </div>

    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <a href="/da/app/indstillinger">Indstillinger</a>
      <button
        onClick={handleSignOut}
        style={{ background: "#000", color: "#fff", padding: "6px 10px", borderRadius: 8 }}
      >
        Log ud
      </button>
    </div>
  </div>
</header>

        {/* SIDEINDHOLD */}
        <main style={{ padding: 16 }}>
          {loading || !orgReady ? <div>Loader…</div> : children}
        </main>
      </div>

      {/* PROFIL-MODAL: kun hvis navn mangler */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialFirstName={firstName}
        initialLastName={lastName}
        onSaved={(f, l) => {
          setFirstName(f);
          setLastName(l);
        }}
      />
    </div>
  );
}