import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiMinus, FiPlus, FiTag, FiGift } from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { applyCoupon } from "../services/couponService";
import { orderService } from "../services/orderService";

function Cart() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponCartTotal, setCouponCartTotal] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);

  const items = cart?.items || cart?.cartItems || (Array.isArray(cart) ? cart : []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.price ?? item.unitPrice ?? (item.subtotal / (item.quantity || 1)) ?? 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const discount = couponCartTotal !== null ? subtotal - couponCartTotal : 0;
  const total = couponCartTotal !== null ? couponCartTotal + shipping : subtotal + shipping;

  const handleQuantity = async (cartItemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await updateQuantity(cartItemId, { quantity: newQty });
    } catch {
      toast.error("Quantity update failed.");
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
      toast.success("Item removed.");
    } catch {
      toast.error("Could not remove item.");
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const normalizedCode = couponCode.trim().toUpperCase();
    try {
      const res = await applyCoupon({ code: normalizedCode, cartTotal: subtotal });
      const data = res.data;

      const newTotal = typeof data === "number"
        ? data
        : typeof data === "string"
          ? parseFloat(data)
          : data?.finalAmount ?? data?.newTotal ?? data?.discountedTotal ?? data?.total ?? data?.amount;

      if (newTotal !== undefined && !isNaN(newTotal)) {
        setCouponCartTotal(newTotal);
        toast.success("Coupon applied! 🎉");
      } else {
        toast.error("Invalid coupon response.");
      }
    } catch (e) {
      const data = e?.response?.data;
      const msg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.title ||
        (Array.isArray(data) && data[0]?.description) ||
        "Invalid coupon code.";
      toast.error(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address.");
      return;
    }
    setOrderLoading(true);
    try {
      const orderPayload = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod: Number(paymentMethod),
      };
      if (giftMessage.trim()) {
        orderPayload.giftMessage = giftMessage.trim();
      }
      if (couponCode.trim()) {
        orderPayload.couponCode = couponCode.trim().toUpperCase();
      }
      await orderService.createOrder(orderPayload);
      toast.success("Order placed successfully!");
      await clearCart();
      navigate("/orders");
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        "Order failed."
      );
    } finally {
      setOrderLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-8 sm:p-10 text-center border border-[#EFE4DF] max-w-sm w-full">
          <div className="w-16 h-16 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-2xl">🛒</div>
          <h2 className="mt-5 text-2xl font-black">Sign in to view your cart</h2>
          <p className="mt-2 text-sm text-[#7A7272]">You need to be logged in to see your cart.</p>
          <Link to="/login" className="inline-block mt-6 bg-[#D90452] text-white px-8 py-4 rounded-full font-black w-full text-center">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-black text-[#7A7272]">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-8 sm:p-10 text-center border border-[#EFE4DF] max-w-md w-full">
          <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-3xl">🛒</div>
          <h2 className="mt-6 text-2xl font-black">Your cart is empty</h2>
          <p className="mt-2 text-[#7A7272]">Discover unique handmade gifts for your loved ones.</p>
          <Link to="/explore" className="inline-block mt-6 bg-[#D90452] text-white px-8 py-4 rounded-full font-black">
            Explore Gifts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-28 lg:pb-10">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Shopping</p>
      <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-[#1E1B1B]">
        {user?.name || user?.fullName ? `${user?.name || user?.fullName}'s` : "Your"} Boutique Cart
      </h1>
      <p className="mt-1 text-sm text-[#7A7272]">
        You have {items.length} artisanal item{items.length !== 1 ? "s" : ""} waiting for a home.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-6 lg:gap-8 mt-6 lg:mt-8">

        {/* Left — Cart Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const imgSrc =
              item.productImage ||
              item.images?.[0] ||
              item.imageUrl ||
              item.product?.images?.[0] ||
              item.product?.imageUrl ||
              null;

            const title = item.productTitle || item.title || item.product?.title || "Product";
            const price = item.price ?? item.unitPrice ?? (item.subtotal / (item.quantity || 1)) ?? 0;
            const category = item.category || item.categoryName || item.product?.category?.name || "";
            const itemId = item.cartItemId || item.id;

            return (
              <div key={itemId} className="bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 border border-[#EFE4DF] flex gap-4">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] sm:rounded-[18px] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] sm:rounded-[18px] bg-[#F8F1EC] flex items-center justify-center flex-shrink-0 text-2xl">
                    🎁
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {category && (
                        <p className="text-[10px] text-[#D90452] font-black uppercase tracking-wider truncate">{category}</p>
                      )}
                      <h3 className="font-black text-[#1E1B1B] mt-0.5 text-sm sm:text-base leading-snug">{title}</h3>
                    </div>
                    <p className="text-[#D90452] font-black text-base sm:text-lg flex-shrink-0">
                      ${(price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 bg-[#F8F1EC] rounded-full px-3 sm:px-4 py-2">
                      <button
                        onClick={() => handleQuantity(itemId, item.quantity, -1)}
                        className="text-[#D90452] w-5 h-5 flex items-center justify-center"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(itemId, item.quantity, 1)}
                        className="text-[#D90452] w-5 h-5 flex items-center justify-center"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(itemId)}
                      className="flex items-center gap-1.5 text-sm text-[#D90452] font-black"
                    >
                      <FiTrash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Gift Message */}
          <div className="bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 border border-dashed border-[#D90452]">
            <div className="flex items-center gap-3 mb-3">
              <FiGift className="text-[#D90452]" size={18} />
              <h3 className="font-black text-[#1E1B1B]">Add a gift message</h3>
            </div>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="Write a heartfelt note..."
              className="w-full bg-[#F8F1EC] rounded-[16px] p-4 text-sm outline-none resize-none h-[90px]"
            />
          </div>
        </div>

        {/* Right — Order Summary */}
        <div>
          <div className="bg-white rounded-[22px] sm:rounded-[26px] p-5 sm:p-6 border border-[#EFE4DF] lg:sticky lg:top-6">
            <h2 className="text-lg sm:text-xl font-black">Order Summary</h2>

            <div className="mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262] block mb-2">
                Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                className="w-full bg-[#F8F1EC] rounded-[18px] p-4 outline-none resize-none h-[100px] text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262] block mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(Number(e.target.value))}
                className="w-full bg-[#F8F1EC] rounded-full px-5 py-3.5 outline-none text-sm"
              >
                <option value={1}>Credit Card</option>
                <option value={2}>Cash On Delivery</option>
                <option value={3}>PayPal</option>
              </select>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7A7272]">Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7272]">Shipping</span>
                <span className="font-bold">{shipping === 0 ? "Free 🎉" : `$${shipping.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span>
                  <span className="font-bold">-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#F8F1EC] rounded-full px-4 py-3">
                <FiTag className="text-[#D90452] flex-shrink-0" size={13} />
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="bg-transparent outline-none text-sm flex-1 min-w-0"
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="bg-[#1E1B1B] text-white px-4 sm:px-5 py-3 rounded-full font-black text-sm disabled:opacity-60 flex-shrink-0"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-[#EFE4DF] flex justify-between items-center">
              <span className="font-black text-base sm:text-lg">Total</span>
              <span className="font-black text-2xl sm:text-3xl text-[#D90452]">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={orderLoading}
              className="mt-4 w-full bg-[#D90452] text-white py-4 rounded-full font-black disabled:opacity-60 text-sm sm:text-base"
            >
              {orderLoading ? "Placing order..." : "Proceed to Checkout →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;