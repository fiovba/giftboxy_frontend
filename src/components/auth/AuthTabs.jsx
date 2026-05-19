import { Link, useLocation } from "react-router-dom";

function AuthTabs() {
  const { pathname } = useLocation();

  return (
    <div className="bg-[#F8F1EC] rounded-full p-1 inline-flex">
      <Link
        to="/register-buyer"
        className={`px-6 py-2 rounded-full text-sm font-black ${
          pathname.includes("buyer")
            ? "bg-[#D90452] text-white"
            : "text-[#6F6262]"
        }`}
      >
        Buyer
      </Link>

      <Link
        to="/register-seller"
        className={`px-6 py-2 rounded-full text-sm font-black ${
          pathname.includes("seller")
            ? "bg-[#D90452] text-white"
            : "text-[#6F6262]"
        }`}
      >
        Seller
      </Link>
    </div>
  );
}

export default AuthTabs;