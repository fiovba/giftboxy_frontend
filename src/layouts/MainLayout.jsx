import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

// Pages where footer should be hidden
const NO_FOOTER_PATHS = ["/gift-finder"];

function MainLayout() {
  const { isSeller, loading } = useAuth();
  const { pathname } = useLocation();
  const hideFooter = NO_FOOTER_PATHS.includes(pathname);

  if (!loading && isSeller) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F5] text-[#2D2D2D]">
      <Navbar />
      <main className="flex-1 relative z-0">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default MainLayout;
