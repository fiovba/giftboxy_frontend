import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiBox, FiShoppingBag, FiPlusCircle,
  FiUser, FiLogOut, FiMessageCircle, FiHelpCircle, FiMenu, FiTag,
} from "react-icons/fi";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function SellerSidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { clearCart } = useCart();
  const [moreOpen, setMoreOpen] = useState(false);

  const allLinks = [
    { name: "Dashboard", path: "/seller/dashboard", icon: <FiGrid /> },
    { name: "Products", path: "/seller/products", icon: <FiBox /> },
    { name: "Orders", path: "/seller/orders", icon: <FiShoppingBag /> },
    { name: "Messages", path: "/seller/messages", icon: <FiMessageCircle /> },
    { name: "Questions", path: "/seller/questions", icon: <FiHelpCircle /> },
    { name: "Coupons", path: "/seller/coupons", icon: <FiTag /> },
    { name: "Add", path: "/seller/add-product", icon: <FiPlusCircle /> },
    { name: "Profile", path: "/seller/profile", icon: <FiUser /> },
  ];

  // Mobiledə ilk 5-i göstər, qalanları "More"-da
  const mobileMain = allLinks.slice(0, 5);
  const mobileMore = allLinks.slice(5);

  const handleLogout = async () => {
    await clearCart();
    await logout();
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-[#EFE4DF] p-6 flex-col justify-between z-50">
        <div>
          <h2 className="text-3xl font-black text-[#D90452]">GiftBoxy</h2>
          <div className="mt-10 flex flex-col gap-2">
            {allLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition ${
                    isActive
                      ? "bg-[#D90452] text-white"
                      : "hover:bg-[#F9E5EB] text-[#2B1D1D]"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-[#D90452] hover:bg-[#F9E5EB] transition"
        >
          <FiLogOut />
          Logout
        </button>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EFE4DF] z-50 px-1 py-1">
        <div className="flex items-center justify-around">
          {mobileMain.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-[9px] font-black transition ${
                  isActive ? "bg-[#D90452] text-white" : "text-[#3B2727]"
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl text-[9px] font-black text-[#3B2727]"
          >
            <FiMenu className="text-base" />
            More
          </button>
        </div>

        {/* More menu popup */}
        {moreOpen && (
          <div className="absolute bottom-[60px] right-2 bg-white rounded-[20px] shadow-xl border border-[#EFE4DF] p-3 min-w-[160px]">
            {mobileMore.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                    isActive ? "bg-[#D90452] text-white" : "hover:bg-[#F9E5EB] text-[#2B1D1D]"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-[#D90452] hover:bg-[#F9E5EB] transition"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

export default SellerSidebar;