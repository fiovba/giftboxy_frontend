import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { orderService } from "../../services/orderService";

const STATUS_MAP = {
  1: "Pending",
  2: "Confirmed",
  3: "Preparing",
  4: "Shipped",
  5: "Delivered",
  6: "Cancelled",
};

const STATUS_COLORS = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-orange-100 text-orange-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-green-100 text-green-700",
  6: "bg-red-100 text-red-700",
};

const NEXT_STATUS = {
  1: { next: 2, label: "Confirm Order", color: "bg-blue-500 text-white" },
  2: { next: 3, label: "Start Preparing", color: "bg-orange-500 text-white" },
  3: { next: 4, label: "Mark as Shipped", color: "bg-purple-500 text-white" },
  4: { next: 5, label: "Mark as Delivered ✓", color: "bg-green-500 text-white" },
};

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

const getTotal = (order) =>
  Number(order.total || order.totalAmount || order.subtotal || order.totalPrice || 0);

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    orderService.getSellerOrders()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) setOrders(data);
        else if (Array.isArray(data?.items)) setOrders(data.items);
        else if (Array.isArray(data?.orders)) setOrders(data.orders);
        else if (Array.isArray(data?.data)) setOrders(data.data);
        else setOrders([]);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdating(orderId);
    try {
      await orderService.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o)
      );
      if (nextStatus === 5) {
        toast.success("Order delivered! Buyer can now write a review. ✓");
      } else if (nextStatus === 4) {
        toast.success("Order marked as Shipped!");
      } else if (nextStatus === 3) {
        toast.success("Order is being prepared!");
      } else if (nextStatus === 2) {
        toast.success("Order confirmed!");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Status update failed.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-0">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Orders</p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black">Seller Orders</h1>
      <p className="mt-1 text-[#7A7272] text-sm">Manage and track orders from your store.</p>

      <div className="mt-8 space-y-5">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[30px] p-10 text-center border border-[#EFE4DF]">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-2xl font-black">No orders yet</h2>
            <p className="text-[#7A7272] mt-2">Orders from buyers will appear here.</p>
          </div>
        ) : (
          orders.map((order) => {
            const items = order.items || order.orderItems || [];
            const total = getTotal(order);
            const customer =
              order.customerName || order.buyerName ||
              order.buyerFullName || order.buyer?.name ||
              order.buyer?.fullName || "—";
            const statusNum = order.status;
            const nextAction = NEXT_STATUS[statusNum];
            const isUpdating = updating === order.id;

            return (
              <div key={order.id} className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#EFE4DF]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-black text-lg">Order #{order.id}</h2>
                    <p className="text-sm text-[#7A7272] mt-0.5">Customer: {customer}</p>
                    <p className="text-sm text-[#7A7272]">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black ${STATUS_COLORS[statusNum] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_MAP[statusNum] || "Unknown"}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        statusNum >= step ? "bg-[#D90452]" : "bg-[#EFE4DF]"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {["Pending", "Confirmed", "Preparing", "Shipped", "Delivered"].map((label, i) => (
                    <span
                      key={label}
                      className={`text-[9px] font-bold ${statusNum >= i + 1 ? "text-[#D90452]" : "text-[#C4B8B4]"}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
                    {items.map((item, idx) => {
                      const imgSrc = getFullUrl(
                        item.productImage || item.images?.[0] ||
                        item.imageUrl || item.product?.images?.[0]
                      );
                      return (
                        <div key={item.id || idx} className="flex gap-3 bg-[#F8F1EC] rounded-[16px] p-3">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={item.productTitle || item.title}
                              className="w-14 h-14 rounded-[12px] object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-[12px] bg-white flex items-center justify-center flex-shrink-0 text-xl">
                              🎁
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-black text-sm leading-snug truncate">
                              {item.productTitle || item.title || item.product?.title}
                            </h3>
                            <p className="text-xs text-[#7A7272] mt-0.5">Qty: {item.quantity}</p>
                            <p className="text-xs text-[#D90452] font-black mt-0.5">
                              ${Number(item.price || item.unitPrice || item.subtotal || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-[#7A7272]">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>

                  <div className="flex items-center gap-3">
                    <p className="text-xl font-black text-[#D90452]">${total.toFixed(2)}</p>

                    {nextAction && statusNum !== 6 && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextAction.next)}
                        disabled={isUpdating}
                        className={`px-5 py-2.5 rounded-full font-black text-sm disabled:opacity-60 transition ${nextAction.color}`}
                      >
                        {isUpdating ? "Updating..." : nextAction.label}
                      </button>
                    )}

                    {statusNum === 5 && (
                      <span className="px-4 py-2 rounded-full font-black text-sm bg-green-100 text-green-700">
                        ✓ Completed
                      </span>
                    )}

                    {statusNum === 6 && (
                      <span className="px-4 py-2 rounded-full font-black text-sm bg-red-100 text-red-500">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {statusNum === 5 && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-[14px] px-4 py-3 text-xs text-green-700 font-bold">
                    ✓ Order delivered — buyer can now write a review for purchased products.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SellerOrders;