export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #eee", padding: "16px 0", marginTop: 40 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px", display: "flex", gap: 16, fontSize: 14 }}>
        <a href="/da/betingelser">Betingelser</a>
        <span>·</span>
        <a href="/da/databehandleraftale">Databehandleraftale</a>
      </div>
    </footer>
  );
}