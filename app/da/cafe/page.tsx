import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Notice from "../../../components/Notice";

export default function Page() {
  return (
    <main>
      <Header />
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
        <h1>Café – test</h1>
        <p>Klik “Opret konto” i headeren for at åbne pop-up’en.</p>
      </section>
      <Footer />
    </main>
  );
}