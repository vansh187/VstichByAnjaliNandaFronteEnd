import { useNavigate } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import StateNotice from "../components/StateNotice";
import { useReveal } from "../hooks/useReveal";

export default function SummerLuxePage() {
  const revealRef = useReveal();
  const navigate = useNavigate();

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="bg-cream">
          <div className="mx-auto max-w-3xl px-5 pt-14 pb-10 text-center sm:px-8 sm:pt-20">
            <p className="font-sans text-xs font-semibold tracking-[0.32em] text-gold uppercase">
              Summer Luxe
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              A new edit, arriving soon
            </h1>
            <p className="mt-5 text-base leading-relaxed text-charcoal/80">
              We're putting the finishing touches on our Summer Luxe collection.
              Check back shortly, or browse everything already in store.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
          <StateNotice
            title="Coming soon"
            description="The Summer Luxe edit isn't live yet — in the meantime, explore our full collections."
            actionLabel="Browse Collections"
            onAction={() => navigate("/collections")}
          />
        </div>

        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
