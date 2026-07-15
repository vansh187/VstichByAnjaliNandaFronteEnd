import { CartProvider } from "./context/CartContext";
import { useReveal } from "./hooks/useReveal";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Bestsellers from "./components/Bestsellers";
import Features from "./components/Features";
import Story from "./components/Story";
import Testimonials from "./components/Testimonials";
import InstagramGallery from "./components/InstagramGallery";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import FloatingWhatsapp from "./components/FloatingWhatsapp";

function App() {
  const revealRef = useReveal();

  return (
    <CartProvider>
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
        <CartDrawer />
        <FloatingWhatsapp />
      </div>
    </CartProvider>
  );
}

export default App;
