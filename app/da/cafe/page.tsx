import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Notice from "../../../components/Notice";
import { Suspense } from "react";

export default function Page() {
  return (
    <main>
      <Header />

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
        {/* Pak client-komponenten med useSearchParams i Suspense */}
        <Suspense fallback={null}>
          <Notice />
        </Suspense>

        <h1>Café – test</h1>
        <p>Klik “Opret konto” i headeren for at åbne pop-up’en.</p>
      </section>

      <Footer />
    </main>
  );
}