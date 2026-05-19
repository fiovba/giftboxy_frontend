import { createContext, useContext, useEffect, useState } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isBuyer, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCart = async () => {
    if (!isAuthenticated || !isBuyer) return;
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (data) => {
    const payload = {
      productId: data.productId || data.id,
      quantity: data.quantity || 1,
    };
    if (data.personalization) {
      payload.personalization = data.personalization;
    }
    await cartService.addToCart(payload);
    await getCart();
  };

  const updateQuantity = async (cartItemId, data) => {
    const quantity = typeof data === "number" ? data : data?.quantity;
    await cartService.updateCartItem(cartItemId, { quantity });
    await getCart();
  };

  const removeFromCart = async (cartItemId) => {
    await cartService.deleteCartItem(cartItemId);
    await getCart();
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
    } catch {}
    setCart(null);
  };

  const cartCount = (() => {
    const items = cart?.items || cart?.cartItems || (Array.isArray(cart) ? cart : []);
    return Array.isArray(items) ? items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
  })();

  useEffect(() => {
    getCart();
  }, [isAuthenticated, isBuyer]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        getCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);