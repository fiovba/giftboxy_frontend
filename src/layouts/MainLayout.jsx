import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

const FULLSCREEN_PATHS = ["/gift-finder"];

function MainLayout() {
  const { isSeller, loading } = useAuth();
  const { pathname } = useLocation();
  const fullscreen = FULLSCREEN_PATHS.includes(pathname);

  if (!loading && isSeller) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return (
    <div
      className={
        "flex flex-col bg-[#FFF8F5] text-[#2D2D2D] " +
        (fullscreen ? "h-screen overflow-hidden" : "min-h-screen")
      }
    >
      <Navbar />
      <main
        className={
          "relative z-0 " +
          (fullscreen ? "flex-1 flex flex-col min-h-0 overflow-hidden" : "flex-1")
        }
      >
        <Outlet />
      </main>
      {!fullscreen && <Footer />}
    </div>
  );
}

export default MainLayout;
