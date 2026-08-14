import { useReveal } from "../hooks/useReveal";
import { useSeo } from "../hooks/useSeo";
import { FRONTEND_BASE_URL } from "../lib/apiConfig";
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

// sameAs assumes the Instagram handle shown site-wide (@vstitchbyanjalinanda,
// see InstagramGallery) is the real profile URL - worth confirming, and
// worth extending with Facebook/Pinterest/etc. if those exist too.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VStitch by Anjali Nanda",
  url: FRONTEND_BASE_URL,
  logo: `${FRONTEND_BASE_URL}/static/brand/logo.jpg`,
  description:
    "Handcrafted couture, sarees, suits and bespoke tailoring — timeless Indian craftsmanship, made for you.",
  email: "vstitchbyanjalinanda@gmail.com",
  telephone: "+91-9953149142",
  sameAs: ["https://www.instagram.com/vstitchbyanjalinanda/"],
};

export default function HomePage() {
  const revealRef = useReveal();

  useSeo({
    title: "VStitch by Anjali Nanda | Handcrafted Couture & Bespoke Tailoring",
    description:
      "VStitch by Anjali Nanda — handcrafted couture, sarees, suits and bespoke tailoring. Timeless Indian craftsmanship, made for you.",
    path: "/",
    jsonLd: ORGANIZATION_JSON_LD,
  });

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
