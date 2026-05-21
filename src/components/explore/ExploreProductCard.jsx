import { useState } from "react";
import toast from "react-hot-toast";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { GoHeartFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import AuthPromptModal from "../common/AuthPromptModal";

function ExploreProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [authModal, setAuthModal] = useState(null); // "cart" | "wishlist" | null

  const liked = isInWishlist(product.id);

  const image =
    product.images?.[0] ||
    product.imageUrl ||
    product.thumbnailUrl ||
    "";

  const stock =
    product.stock ??
    product.quantity ??
    product.stockCount ??
    product.availableStock ??
    0;

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      setAuthModal("wishlist");
      return;
    }
    const wasLiked = liked;
    await toggleWishlist(product);
    if (wasLiked) {
      toast.success("Removed from wishlist.");
    }
    // No toast when adding — per user preference
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setAuthModal("cart");
      return;
    }
    if (stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    addToCart(product);
    toast.custom(
      (t) => (
        <div className={`flex items-center gap-3 bg-white rounded-[20px] shadow-2xl border border-[#EFE4DF] px-4 py-3 min-w-[240px] max-w-[320px] ${t.visible ? "toast-enter" : "toast-leave"}`}>
          {image ? (
            <img src={image} alt="" className="w-11 h-11 rounded-[12px] object-cover flex-shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-[12px] bg-[#F8E7EC] flex items-center justify-center flex-shrink-0 text-lg">🛒</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-black text-[#1E1B1B] text-sm">Added to cart!</p>
            <p className="text-xs text-[#7A7272] truncate mt-0.5">{product.title}</p>
          </div>
          <div className="w-7 h-7 bg-[#D90452] rounded-full flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
              <path d="M1 5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ),
      { duration: 2500 }
    );
  };

  return (
    <>
    <div className="bg-white rounded-[26px] overflow-hidden shadow-sm border border-[#EEE4DF] card-lift anim-fade-up">
      <div className="relative">
        <Link to={`/product/${product.slug}`}>
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="h-[240px] w-full object-cover"
            />
          ) : (
            <div className="h-[240px] w-full bg-[#F8F1EC] flex items-center justify-center text-[#8B7C77] font-black">
              No Image
            </div>
          )}
        </Link>

        {(product.badge || product.isBestSeller) && (
          <span className="absolute top-4 left-4 bg-[#D90452] text-white px-3 py-2 rounded-full text-xs font-black">
            {product.badge || "Best Seller"}
          </span>
        )}

        {stock <= 0 && (
          <span className="absolute bottom-4 left-4 bg-[#1E1B1B] text-white px-3 py-2 rounded-full text-xs font-black">
            Out of Stock
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition ${
            liked
              ? "bg-[#D90452] text-white"
              : "bg-white text-[#1E1B1B] hover:bg-[#F8E7EC] hover:text-[#D90452]"
          }`}
        >
          {liked ? <GoHeartFill size={18} /> : <FiHeart size={18} />}
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs text-[#8B7C77] uppercase font-semibold">
          {product.category}
        </p>

        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-2 font-black text-[#1E1B1B] text-lg leading-snug min-h-[52px]">
            {product.title}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-[#7A7272] line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-[#D90452] font-black text-xl">
            ${product.price}
          </span>
          {!!product.oldPrice && (
            <span className="text-sm text-[#A39A96] line-through">
              ${product.oldPrice}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`mt-5 w-full py-3 rounded-full font-black flex items-center justify-center gap-2 transition ${
            stock <= 0
              ? "bg-[#E7DDDA] text-[#8B7C77] cursor-not-allowed"
              : "bg-[#D90452] text-white hover:bg-[#BE0348] btn-press"
          }`}
        >
          <FiShoppingCart />
          {stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>

    <AuthPromptModal
      isOpen={authModal !== null}
      trigger={authModal || "cart"}
      onClose={() => setAuthModal(null)}
    />
    </>
  );
}

export default ExploreProductCard;
