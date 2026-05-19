import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiX, FiStar } from "react-icons/fi";
import { orderService } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_MAP = {
  1: "pending",
  2: "confirmed",
  3: "preparing",
  4: "shipped",
  5: "delivered",
  6: "cancelled",
};

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  shipped:   "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const getStatusKey = (status) =>
  typeof status === "number"
    ? STATUS_MAP[status] || "pending"
    : (status || "").toString().toLowerCase();

const getTotal = (order) =>
  Number(order.total || order.totalAmount || order.subtotal || order.totalPrice || 0);

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

const isCancellable = (status) => status === 1 || status === 2;

function Orders() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    orderService.getMyOrders()
      .then((res) => {
        const d = res.data;
        if (Array.isArray(d)) setOrders(d);
        else if (Array.isArray(d?.items)) setOrders(d.items);
        else if (Array.isArray(d?.orders)) setOrders(d.orders);
        else if (Array.isArray(d?.data)) setOrders(d.data);
        else setOrders([]);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (orderId) => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: 6 } : o)
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: 6 }));
      }
      toast.success("Order cancelled.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const goToReview = async (item) => {
    const slug = item.productSlug || item.slug || item.product?.slug;
    const productId = item.productId || item.product?.id;

    if (slug) {
      navigate(`/product/${slug}`);
      return;
    }

    if (productId) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/api/products`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.items) ? data.items
          : Array.isArray(data?.data) ? data.data : [];
        const found = list.find(p => String(p.id) === String(productId));
        if (found?.slug) {
          navigate(`/product/${found.slug}`);
        } else {
          toast.error("Product not found.");
        }
      } catch {
        toast.error("Product not found.");
      }
      return;
    }

    toast.error("Product not found.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF]">
          <h2 className="text-2xl font-black">Sign in to view your orders</h2>
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
        <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-24">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Account</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black">My Orders</h1>
      <p className="mt-1 text-[#7A7272]">Track and manage your purchases.</p>

      {orders.length === 0 ? (
        <div className="mt-10 bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF]">
          <div className="w-20 h-20 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto text-3xl">📦</div>
          <h2 className="mt-6 text-2xl font-black">No orders yet</h2>
          <p className="mt-2 text-[#7A7272]">Start shopping to see your orders here.</p>
          <Link to="/explore" className="inline-block mt-6 bg-[#D90452] text-white px-8 py-4 rounded-full font-black">
            Explore Gifts
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const statusKey = getStatusKey(order.status);
            const statusColor = STATUS_COLORS[statusKey] || "bg-gray-100 text-gray-600";
            const items = order.items || order.orderItems || [];
            const total = getTotal(order);
            const isDelivered = order.status === 5;

            return (
              <div key={order.id} className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EFE4DF]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-[#7A7272] font-bold">
                      Order #{order.id} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-black text-lg mt-1">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </h3>
                    <p className="text-[#D90452] font-black text-xl mt-1">${total.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black capitalize ${statusColor}`}>
                      {statusKey}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 text-sm font-black text-[#D90452]"
                    >
                      Details <FiChevronRight size={14} />
                    </button>
                    {isCancellable(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling}
                        className="text-xs font-black text-red-500 border border-red-200 px-3 py-1.5 rounded-full disabled:opacity-50 hover:bg-red-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {items.slice(0, 4).map((item, idx) => {
                      const imgSrc = getFullUrl(item.productImage || item.images?.[0] || item.imageUrl);
                      return (
                        <div key={item.id || idx} className="flex-shrink-0 flex items-center gap-3 bg-[#F8F1EC] rounded-[16px] px-4 py-3">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-10 h-10 rounded-[10px] object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center text-lg">🎁</div>
                          )}
                          <div>
                            <p className="text-xs font-black leading-snug">
                              {item.productTitle || item.title || item.product?.title}
                            </p>
                            <p className="text-xs text-[#7A7272]">x{item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isDelivered && items.length > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-[16px] px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs font-black text-green-700">✓ Order Delivered</p>
                      <p className="text-xs text-green-600 mt-0.5">Share your experience!</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {items.map((item, idx) => (
                        <button
                          key={item.id || idx}
                          onClick={() => goToReview(item)}
                          className="flex items-center gap-1.5 bg-[#D90452] text-white px-4 py-2 rounded-full text-xs font-black hover:bg-[#b8033f] transition"
                        >
                          <FiStar size={11} />
                          Review {item.productTitle || item.title || "Product"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
        >
          <div className="bg-white rounded-[28px] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-xl">Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-[#7A7272] hover:text-[#D90452]">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#7A7272]">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black capitalize ${STATUS_COLORS[getStatusKey(selectedOrder.status)] || "bg-gray-100"}`}>
                  {getStatusKey(selectedOrder.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7272]">Date</span>
                <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7272]">Shipping Address</span>
                <span className="font-bold text-right max-w-[60%]">{selectedOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7272]">Payment</span>
                <span className="font-bold">
                  {selectedOrder.paymentMethod === 1 ? "Credit Card"
                    : selectedOrder.paymentMethod === 2 ? "Cash On Delivery"
                    : selectedOrder.paymentMethod === 3 ? "PayPal"
                    : selectedOrder.paymentMethod}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {(selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => {
                const imgSrc = getFullUrl(item.productImage || item.imageUrl);
                return (
                  <div key={item.id || idx} className="flex items-center gap-4 bg-[#F8F1EC] rounded-[16px] p-4">
                    {imgSrc ? (
                      <img src={imgSrc} alt="" className="w-14 h-14 rounded-[12px] object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-[12px] bg-white flex items-center justify-center text-2xl flex-shrink-0">🎁</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{item.productTitle || item.title}</p>
                      <p className="text-xs text-[#7A7272] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-[#D90452] flex-shrink-0">
                      ${Number(item.price || item.unitPrice || item.subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#EFE4DF] flex justify-between items-center">
              <span className="font-black text-lg">Total</span>
              <span className="font-black text-2xl text-[#D90452]">
                ${getTotal(selectedOrder).toFixed(2)}
              </span>
            </div>

            {isCancellable(selectedOrder.status) && (
              <button
                onClick={() => handleCancel(selectedOrder.id)}
                disabled={cancelling}
                className="mt-4 w-full border-2 border-red-300 text-red-500 py-3 rounded-full font-black text-sm disabled:opacity-50 hover:bg-red-50 transition"
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}

            {selectedOrder.status === 5 && (
              <div className="mt-4 bg-green-50 rounded-[16px] p-4">
                <p className="text-xs font-black text-green-700 mb-3">
                  ✓ Write a review for your purchased items:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedOrder.items || selectedOrder.orderItems || []).map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        setSelectedOrder(null);
                        goToReview(item);
                      }}
                      className="flex items-center gap-1.5 bg-[#D90452] text-white px-4 py-2 rounded-full text-xs font-black hover:bg-[#b8033f] transition"
                    >
                      <FiStar size={11} />
                      Review {item.productTitle || item.title || "Product"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;