import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const { isSeller, loading } = useAuth();

  if (!loading && isSeller) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F5] text-[#2D2D2D]">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;