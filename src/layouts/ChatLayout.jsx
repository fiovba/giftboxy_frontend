import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";

function ChatLayout() {
  const { isSeller, loading } = useAuth();

  if (!loading && isSeller) {
    return <Navigate to="/seller/messages" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-[#FFF8F5] text-[#2D2D2D] overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </main>
    </div>
  );
}

export default ChatLayout;
