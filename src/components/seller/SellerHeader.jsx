import { useEffect, useState } from "react";
import { FiBell, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sellerProfileService } from "../../services/sellerProfileService";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";

const getFullUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

function SellerHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    sellerProfileService.getMySellerProfile()
      .then((res) => {
        const avatar = res.data?.avatar || res.data?.avatarUrl || "";
        setAvatarUrl(getFullUrl(avatar));
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    navigate(`/seller/products?search=${e.target.value}`);
  };

  return (
    <header className="bg-white px-4 py-4 sm:px-6 lg:px-8 lg:py-5 border-b border-[#EFE4DF]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E1B1B]">
            Welcome back, {user?.name || user?.fullName}
          </h1>
          <p className="text-[#7B7272] mt-1 text-sm">
            Manage your products and orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F7F3F1] rounded-full px-4 py-3 flex items-center gap-3 flex-1 lg:w-[320px]">
            <FiSearch className="text-[#8E8585]" />
            <input
              type="text"
              onChange={handleSearch}
              placeholder="Search products..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#F7F3F1] flex items-center justify-center text-xl shrink-0">
            <FiBell />
          </button>

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name}
              className="w-11 h-11 lg:w-12 lg:h-12 rounded-full object-cover shrink-0 border-2 border-[#F8E7EC]"
            />
          ) : (
            <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#F8E7EC] flex items-center justify-center shrink-0 text-lg font-black text-[#D90452]">
              {(user?.name || user?.fullName || "S").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default SellerHeader;