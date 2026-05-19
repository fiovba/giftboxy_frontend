import { Outlet } from "react-router-dom";
import SellerSidebar from "../components/seller/SellerSidebar";
import SellerHeader from "../components/seller/SellerHeader";

function SellerLayout() {
  return (
    <div className="min-h-screen bg-[#F7F3F1]">
      <SellerSidebar />

      <div className="lg:pl-[260px]">
        <SellerHeader />

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SellerLayout;