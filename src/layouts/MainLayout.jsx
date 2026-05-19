import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F5] text-[#2D2D2D]">
      <Navbar />
      <main className="flex-1 relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;