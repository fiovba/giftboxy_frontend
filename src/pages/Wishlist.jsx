import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { GoHeartFill } from "react-icons/go";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF] max-w-md w-full">
          <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-3xl">
            <FiHeart className="text-[#D90452]" />
          </div>
          <h2 className="mt-6 text-2xl font-black">Sign in to view your wishlist</h2>
          <Link to="/login" className="inline-block mt-6 bg-[#D90452] text-white px-8 py-4 rounded-full font-black">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xl font-black text-[#7A7272]">Loading wishlist...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF] max-w-md w-full">
          <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto">
            <GoHeartFill className="text-[#D90452]" size={32} />
          </div>
          <h2 className="mt-6 text-2xl font-black">Your wishlist is empty</h2>
          <p className="mt-2 text-[#7A7272]">Save items you love and come back to them later.</p>
          <Link to="/explore" className="inline-block mt-6 bg-[#D90452] text-white px-8 py-4 rounded-full font-black">
            Explore Gifts
          </Link>
        </div>
      </div>
    );
  }

  const handleMoveToCart = async (item) => {
    try {
      const product = item.product || item;

      const productId =
        item.productId ||
        product.id ||
        product.productId;

      if (!productId) {
        toast.error("Product ID not found.");
        return;
      }

      await addToCart({
        productId,
        quantity: 1,
      });

      toast.success("Moved to cart.");
    } catch {
      toast.error("Could not move to cart.");
    }
  };

  const handleRemove = async (item) => {
    try {
      const wishlistItemId =
        item.wishlistItemId ||
        item.id ||
        item.wishlistId;

      if (!wishlistItemId) {
        toast.error("Item ID not found.");
        return;
      }

      await removeFromWishlist(wishlistItemId);
      toast.success("Removed from wishlist.");
    } catch {
      toast.error("Could not remove item.");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Saved Items</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[#1E1B1B]">Your Wishlist</h1>
      <p className="mt-1 text-[#7A7272]">
        {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved for later.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
        {wishlist.map((item) => {
          const product = item.product || item;
          const imgSrc =
            item.productImage ||
            product.productImage ||
            product.images?.[0] ||
            product.imageUrl ||
            item.imageUrl ||
            null;
          const title = product.title;
          const price = product.price;
          const oldPrice = product.oldPrice;
          const category = product.category?.name || product.category || product.categoryName || "";
          const slug = product.slug || item.productSlug || "";
          const productPath = slug ? `/product/${slug}` : null;

          return (
            <div
              key={item.id || item.wishlistItemId || item.productId || product?.id}
              className="bg-white rounded-[26px] overflow-hidden border border-[#EFE4DF] hover:shadow-lg transition group"
            >
              <div className="relative">
                {productPath ? (
                  <Link to={productPath}>
                    <img
                      src={imgSrc}
                      alt={title}
                      className="w-full h-[220px] object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>
                ) : (
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-[220px] object-cover"
                  />
                )}

                <button
                  onClick={() => handleRemove(item)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#D90452] shadow-md hover:bg-[#D90452] hover:text-white transition"
                >
                  <GoHeartFill size={16} />
                </button>
              </div>

              <div className="p-5">
                {category && (
                  <p className="text-xs text-[#D90452] font-black uppercase tracking-wider">
                    {category}
                  </p>
                )}

                {productPath ? (
                  <Link to={productPath}>
                    <h3 className="mt-2 font-black text-[#1E1B1B] leading-snug line-clamp-2 min-h-[44px] hover:text-[#D90452] transition">
                      {title}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="mt-2 font-black text-[#1E1B1B] leading-snug line-clamp-2 min-h-[44px]">
                    {title}
                  </h3>
                )}

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[#D90452] font-black text-xl">${price}</span>
                  {oldPrice && (
                    <span className="text-sm line-through text-[#A39A96]">${oldPrice}</span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="bg-[#D90452] text-white py-3 rounded-full font-black text-sm flex items-center justify-center gap-1"
                  >
                    <FiShoppingCart size={13} />
                    Move to Cart
                  </button>

                  <button
                    onClick={() => handleRemove(item)}
                    className="bg-[#F8E7EC] text-[#D90452] py-3 rounded-full font-black text-sm flex items-center justify-center gap-1"
                  >
                    <FiTrash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;
