export default function Page() {
  return (
    <main style={{ padding: 20 }}>
      <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "Mangler"}</div>
      <div>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "Mangler"}</div>
    </main>
  );
}