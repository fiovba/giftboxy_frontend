import { createContext, useContext, useEffect, useState } from "react";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isBuyer, isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const getWishlist = async () => {
    if (!isAuthenticated || !isBuyer) return;

    setLoading(true);

    try {
      const res = await wishlistService.getWishlist();
      const data = res.data;
      if (Array.isArray(data)) {
        setWishlist(data);
      } else if (Array.isArray(data?.items)) {
        setWishlist(data.items);
      } else if (Array.isArray(data?.data)) {
        setWishlist(data.data);
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    await wishlistService.addToWishlist(productId);
    await getWishlist();
  };

  const removeFromWishlist = async (wishlistItemId) => {
    await wishlistService.deleteWishlistItem(wishlistItemId);
    await getWishlist();
  };

  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        String(item.productId) === String(productId) ||
        String(item.id) === String(productId) ||
        String(item.product?.id) === String(productId)
    );
  };

  const getWishlistItemId = (productId) => {
    const item = wishlist.find(
      (item) =>
        String(item.productId) === String(productId) ||
        String(item.product?.id) === String(productId)
    );
    return item?.id || item?.wishlistItemId || item?.wishlistId;
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      const itemId = getWishlistItemId(product.id);
      if (itemId) await removeFromWishlist(itemId);
    } else {
      await addToWishlist(product.id);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  useEffect(() => {
    getWishlist();
  }, [isAuthenticated, isBuyer]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        getWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
