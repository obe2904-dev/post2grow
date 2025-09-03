import Link from "next/link";

export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/da" style={{ fontWeight: 600 }}>Post2Grow</Link>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/da/login">Login</Link>
          <Link href="/da/opret" style={{ background: "#000", color: "#fff", padding: "8px 12px", borderRadius: 8 }}>
            Opret konto
          </Link>
        </nav>
      </div>
    </header>
  );
}