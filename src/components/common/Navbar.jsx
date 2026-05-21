import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch, FiHeart, FiShoppingCart, FiChevronDown,
  FiMessageCircle, FiUser, FiLogOut, FiGrid, FiMenu, FiX, FiPackage,
} from "react-icons/fi";

import logo from "../../assets/images/logo.png";
import { getCategories } from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const { wishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    getCategories().then((data) => setCategories(data));
  }, []);

  const handleLogout = async () => {
    await clearCart();
    clearWishlist();
    await logout();
    setUserOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setCategoryOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    navigate(`/explore?search=${encodeURIComponent(searchText.trim())}`);
    setMobileOpen(false);
  };

  return (
    <header className="bg-[#F8F1EC] sticky top-0 z-[100] border-b border-[#EADFDA]">
      <div id="main-navbar" className="w-full bg-[#F8F1EC]">
        {/* TOP NAV */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-[#EADFDA]">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="GiftBoxy" className="h-12 sm:h-14 lg:h-16 w-auto" />
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex flex-1 max-w-[560px] bg-[#F1E8E3] rounded-full px-5 py-3 items-center"
          >
            <FiSearch className="text-[#8B7C77]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search gifts for any occasion..."
              className="bg-transparent outline-none px-3 text-sm w-full text-[#1E1B1B] placeholder:text-[#9B8F8B]"
            />
          </form>

          <div className="flex items-center gap-3 sm:gap-5">
            {isAuthenticated && user?.role === "seller" && (
              <Link to="/seller/dashboard" className="hidden sm:block text-xl text-[#3B2727]">
                <FiGrid />
              </Link>
            )}

            {isAuthenticated && (
              <Link to="/messages" className="hidden sm:block text-xl text-[#3B2727]">
                <FiMessageCircle />
              </Link>
            )}

            <Link to="/wishlist" className="relative text-xl text-[#3B2727]">
              <FiHeart />
              {wishlist?.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-[#C90046] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-xl text-[#3B2727]">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-[#C90046] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="hidden sm:inline-flex bg-[#C90046] text-white px-5 lg:px-6 py-3 rounded-full text-sm font-bold"
              >
                Sign In
              </Link>
            ) : (
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 bg-white px-4 py-3 rounded-full text-sm font-bold text-[#3B2727]"
                >
                  <FiUser />
                  Welcome, {user?.name?.split(" ")[0]}
                  <FiChevronDown />
                </button>

                {userOpen && (
                  <UserDropdown
                    user={user}
                    handleLogout={handleLogout}
                    close={() => setUserOpen(false)}
                  />
                )}
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl text-[#3B2727]"
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* DESKTOP BOTTOM NAV */}
        <div className="hidden lg:flex px-6 py-4 items-center gap-8 text-sm font-semibold text-[#3B2727]">
          <div className="relative">
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-1 text-[#C90046]"
            >
              Categories <FiChevronDown />
            </button>

            {categoryOpen && (
              <div className="absolute top-8 left-0 bg-white w-[560px] rounded-[28px] shadow-xl p-5 border border-[#EEE1DD] z-50">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/explore?category=${category.slug}`}
                      onClick={() => setCategoryOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-[#F9DDE5] hover:text-[#C90046] transition"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-bold leading-tight">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DesktopLinks />
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-[#F8F1EC] border-t border-[#EADFDA] px-4 py-5 overflow-y-auto z-[99]">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-[#F1E8E3] rounded-full px-5 py-3 flex items-center"
            >
              <FiSearch className="text-[#8B7C77]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search gifts..."
                className="bg-transparent outline-none px-3 text-sm w-full"
              />
            </form>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MobileLink to="/explore" onClick={closeMobile}>Gifts</MobileLink>
              <MobileLink to="/gift-finder" onClick={closeMobile}>Giftie AI</MobileLink>
              <MobileLink to="/about" onClick={closeMobile}>About</MobileLink>

              {isAuthenticated && (
                <MobileLink to="/messages" onClick={closeMobile}>Messages</MobileLink>
              )}

              {isAuthenticated && user?.role !== "seller" && (
                <MobileLink to="/orders" onClick={closeMobile}>My Orders</MobileLink>
              )}

              {isAuthenticated && user?.role === "seller" && (
                <MobileLink to="/seller/dashboard" onClick={closeMobile}>Seller Dashboard</MobileLink>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-4 font-black text-[#C90046]"
              >
                Categories <FiChevronDown />
              </button>

              {categoryOpen && (
                <div className="mt-3 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/explore?category=${category.slug}`}
                      onClick={closeMobile}
                      className="bg-white rounded-2xl px-3 py-3 flex items-center gap-2 font-bold text-sm"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="w-full flex justify-center bg-[#C90046] text-white px-6 py-4 rounded-full text-sm font-black"
                >
                  Sign In
                </Link>
              ) : (
                <div className="bg-white rounded-2xl p-4">
                  <p className="font-black">Welcome, {user?.name?.split(" ")[0]}</p>
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full bg-[#F9DDE5] text-[#C90046] py-3 rounded-full font-black flex items-center justify-center gap-2"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function DesktopLinks() {
  return (
    <>
      <Link to="/explore">Gifts</Link>
      <Link to="/gift-finder">Giftie AI</Link>
      <Link to="/about">About</Link>
    </>
  );
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="bg-white rounded-2xl px-4 py-4 font-black text-sm text-[#3B2727]"
    >
      {children}
    </Link>
  );
}

function UserDropdown({ user, handleLogout, close }) {
  return (
    <div className="absolute right-0 top-14 bg-white w-56 rounded-2xl shadow-xl border border-[#EEE1DD] p-3 z-50">
      <Link
        to={user?.role === "seller" ? "/seller/dashboard" : "/profile"}
        onClick={close}
        className="block px-4 py-3 rounded-xl hover:bg-[#F9DDE5] font-semibold"
      >
        {user?.role === "seller" ? "Seller Dashboard" : "My Profile"}
      </Link>

      {user?.role !== "seller" && (
        <Link
          to="/orders"
          onClick={close}
          className="block px-4 py-3 rounded-xl hover:bg-[#F9DDE5] font-semibold flex items-center gap-2"
        >
          <FiPackage size={14} />
          My Orders
        </Link>
      )}

      <Link
        to="/messages"
        onClick={close}
        className="block px-4 py-3 rounded-xl hover:bg-[#F9DDE5] font-semibold"
      >
        Messages
      </Link>

      <Link
        to="/change-password"
        onClick={close}
        className="block px-4 py-3 rounded-xl hover:bg-[#F9DDE5] font-semibold"
      >
        Change Password
      </Link>

      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#F9DDE5] text-[#C90046] font-bold flex items-center gap-2"
      >
        <FiLogOut />
        Logout
      </button>
    </div>
  );
}
export default Navbar;