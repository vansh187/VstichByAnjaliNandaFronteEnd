import { Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import AuthModal from "./pages/AuthModal";
import HomePage from "./pages/HomePage";
import SummerLuxePage from "./pages/SummerLuxePage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import StoryPage from "./pages/StoryPage";
import FaqPage from "./pages/FaqPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CartDrawer from "./components/CartDrawer";
import VstitchAiWidget from "./components/VstitchAiWidget";
import CartToast from "./components/CartToast";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;
  const routedLocation = backgroundLocation || location;

  return (
    <>
      <ScrollToTop pathname={routedLocation.pathname} />
      {/* When navigated to with a backgroundLocation (e.g. clicking "Log In" from
          the landing/home page), the underlying page keeps rendering here so the
          login modal below can overlay it. Direct/refresh visits to /login fall
          back to the full-page AuthPage since there's no page to show behind it. */}
      <Routes location={routedLocation}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/summer-luxe" element={<SummerLuxePage />} />
        {/* keyed by path so switching categories remounts the page — a
            clean useProducts/useCategories state (loading, items, cursor)
            rather than trying to reset it mid-effect */}
        <Route path="/collections" element={<CollectionsPage />} />
        <Route
          path="/collections/:categoryId"
          element={<CollectionPage key={location.pathname} />}
        />
        <Route
          path="/product/:productId"
          element={<ProductDetailPage key={location.pathname} />}
        />
        <Route path="/our-story" element={<StoryPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-order"
          element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/login" element={<AuthModal />} />
        </Routes>
      )}

      <CartDrawer />
      <VstitchAiWidget />
      <CartToast />
    </>
  );
}

export default App;
