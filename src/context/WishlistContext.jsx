import { createContext, useContext, useEffect, useState } from "react";
import { wishlistService } from "../services/wishlistService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

const findItem = (wishlist, productId) =>
  wishlist.find(
    (item) =>
      String(item.productId) === String(productId) ||
      String(item.product?.id) === String(productId) ||
      String(item.id) === String(productId)
  );

const getItemId = (item) =>
  item?.id ?? item?.wishlistItemId ?? item?.wishlistId ?? null;

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
      if (Array.isArray(data)) setWishlist(data);
      else if (Array.isArray(data?.items)) setWishlist(data.items);
      else if (Array.isArray(data?.data)) setWishlist(data.data);
      else setWishlist([]);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    // Optimistic: add temp entry so heart fills immediately
    const tempEntry = { productId: String(productId), id: `temp-${productId}` };
    setWishlist((prev) => [...prev, tempEntry]);
    try {
      await wishlistService.addToWishlist(productId);
      await getWishlist();
    } catch {
      // Rollback on error
      setWishlist((prev) => prev.filter((i) => i.id !== tempEntry.id));
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    // Optimistic: remove immediately so heart unselects without waiting for API
    setWishlist((prev) =>
      prev.filter(
        (item) =>
          item.id !== wishlistItemId &&
          item.wishlistItemId !== wishlistItemId &&
          item.wishlistId !== wishlistItemId
      )
    );
    try {
      await wishlistService.deleteWishlistItem(wishlistItemId);
      await getWishlist();
    } catch {
      // Revert: re-fetch to restore accurate state
      await getWishlist();
    }
  };

  const isInWishlist = (productId) =>
    !!findItem(wishlist, productId);

  const getWishlistItemId = (productId) => {
    const item = findItem(wishlist, productId);
    return getItemId(item);
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      const item = findItem(wishlist, product.id);
      const itemId = getItemId(item);

      if (itemId) {
        await removeFromWishlist(itemId);
      } else {
        // ID bulunamadı — optimistic silme yap ve backend'i yenile
        setWishlist((prev) => prev.filter((i) => !findItem([i], product.id)));
        await getWishlist();
      }
    } else {
      await addToWishlist(product.id);
    }
  };

  const clearWishlist = () => setWishlist([]);

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
