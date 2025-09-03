import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

export default function Page() {
  return (
    <main>
      <Header />
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
        <h1>Café – test</h1>
        <p>Headeren ovenfor har “Login” og “Opret konto”.</p>
      </section>
      <Footer />
    </main>
  );
}