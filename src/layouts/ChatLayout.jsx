import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

function ChatLayout() {
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
