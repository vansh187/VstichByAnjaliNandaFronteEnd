import { useReveal } from "../hooks/useReveal";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Bestsellers from "../components/Bestsellers";
import Features from "../components/Features";
import Story from "../components/Story";
import Testimonials from "../components/Testimonials";
import InstagramGallery from "../components/InstagramGallery";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

export default function LandingPage() {
  const revealRef = useReveal();

  return (
    <div ref={revealRef}>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Bestsellers />
        <Features />
        <Story />
        <Testimonials />
        <InstagramGallery />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
