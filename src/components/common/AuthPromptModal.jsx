import { Link } from "react-router-dom";
import { FiX, FiShoppingCart, FiHeart } from "react-icons/fi";

function AuthPromptModal({ isOpen, onClose, trigger = "cart" }) {
  if (!isOpen) return null;

  const content = {
    cart: {
      emoji: "🛒",
      title: "Add to Your Cart",
      subtitle: "Join GiftBoxy to save items and checkout seamlessly.",
      primaryLabel: "Create Free Account",
      primaryTo: "/register-buyer",
      icon: <FiShoppingCart size={22} className="text-[#D90452]" />,
    },
    wishlist: {
      emoji: "💝",
      title: "Save to Wishlist",
      subtitle: "Create an account to save your favourite gifts for later.",
      primaryLabel: "Create Free Account",
      primaryTo: "/register-buyer",
      icon: <FiHeart size={22} className="text-[#D90452]" />,
    },
  };

  const { emoji, title, subtitle, primaryLabel, primaryTo } = content[trigger] || content.cart;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[32px] px-8 py-10 max-w-[360px] w-full text-center anim-scale-in shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F8F1EC] flex items-center justify-center text-[#7A7272] hover:bg-[#F8E7EC] hover:text-[#D90452] transition"
        >
          <FiX size={16} />
        </button>

        {/* Visual */}
        <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-4xl anim-float shadow-inner">
          {emoji}
        </div>

        {/* Text */}
        <h2 className="mt-5 text-2xl font-black text-[#1E1B1B]">{title}</h2>
        <p className="mt-2 text-sm text-[#7A7272] leading-relaxed">{subtitle}</p>

        {/* Buttons */}
        <div className="mt-7 space-y-3">
          <Link
            to={primaryTo}
            onClick={onClose}
            className="block w-full bg-[#D90452] text-white py-4 rounded-full font-black text-sm hover:bg-[#BE0348] btn-press transition"
          >
            {primaryLabel}
          </Link>

          <Link
            to="/login"
            onClick={onClose}
            className="block w-full bg-[#F8F1EC] text-[#1E1B1B] py-4 rounded-full font-black text-sm hover:bg-[#F0E6DF] btn-press transition"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-5 text-xs text-[#A0918B]">
          Free to join · No credit card required
        </p>
      </div>
    </div>
  );
}

export default AuthPromptModal;
