import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBox, FiDollarSign, FiShoppingBag, FiUsers, FiAlertCircle,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { sellerService } from "../../services/sellerService";
import { orderService } from "../../services/orderService";

function SellerDashboard() {
  const { user } = useAuth();

  const [sellerProducts, setSellerProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  useEffect(() => {
    sellerService.getSellerProducts()
      .then((products) => setSellerProducts(Array.isArray(products) ? products : []))
      .catch(() => setSellerProducts([]));

    orderService.getSellerOrders()
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) setOrders(data);
        else if (Array.isArray(data?.items)) setOrders(data.items);
        else if (Array.isArray(data?.orders)) setOrders(data.orders);
        else if (Array.isArray(data?.data)) setOrders(data.data);
        else setOrders([]);
      })
      .catch(() => setOrders([]));
  }, []);

  // Delivered orders only (status 5)
  const deliveredOrders = orders.filter((o) => o.status === 5);

  const totalRevenue = deliveredOrders.reduce((sum, order) => {
    return sum + Number(
      order.total || order.totalAmount || order.subtotal || order.totalPrice || 0
    );
  }, 0);

  // Stock <= 5 amma > 0
  const lowStockProducts = sellerProducts.filter(
    (p) => {
      const stock = p.stockCount ?? p.stock ?? 0;
      return stock > 0 && stock <= 5;
    }
  );

  // Stock = 0
  const outOfStockProducts = sellerProducts.filter(
    (p) => (p.stockCount ?? p.stock ?? 0) === 0
  );

  return (
    <div className="pb-24 lg:pb-0">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
            Seller Dashboard
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[#1E1B1B]">
            Welcome, {user?.storeName || user?.name}
          </h1>
          <p className="mt-2 text-[#7A7272] text-sm sm:text-base">
            Manage your store, products, stock and orders.
          </p>
        </div>
        <Link
          to="/seller/add-product"
          className="bg-[#D90452] text-white px-6 py-4 rounded-full font-black text-center"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mt-7">
        <StatCard
          icon={<FiDollarSign />}
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          subtitle="From delivered orders"
        />
        <StatCard
          icon={<FiBox />}
          title="Products"
          value={sellerProducts.length}
          subtitle="Active seller listings"
        />
        <StatCard
          icon={<FiShoppingBag />}
          title="Orders"
          value={orders.length}
          subtitle="Seller related orders"
        />
        <StatCard
          icon={<FiUsers />}
          title="Customers"
          value={new Set(orders.map((o) => o.userId || o.buyerId || o.buyerName)).size}
          subtitle="Unique buyers"
        />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6 lg:gap-8 mt-7">
        {/* Recent Products */}
        <section className="bg-white rounded-[28px] lg:rounded-[32px] p-5 lg:p-7 border border-[#EFE4DF]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-black">Recent Products</h2>
              <p className="text-[#7A7272] mt-1 text-sm">Latest products from your shop.</p>
            </div>
            <Link to="/seller/products" className="text-[#D90452] font-black text-sm whitespace-nowrap">
              View All →
            </Link>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="mt-6 bg-[#F8F1EC] rounded-[24px] p-8 text-center">
              <h3 className="text-xl font-black">No products yet</h3>
              <p className="text-[#7A7272] mt-2">Add your first product to start selling.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 mt-6">
              {sellerProducts.slice(0, 6).map((product) => {
                const imgSrc = getFullUrl(product.images?.[0] || product.imageUrl || product.productImage);
                const stock = product.stockCount ?? product.stock ?? 0;
                return (
                  <div key={product.id} className="border border-[#F1E6E2] rounded-[22px] overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={product.title} className="w-full h-[150px] sm:h-[170px] object-cover" />
                    ) : (
                      <div className="w-full h-[150px] sm:h-[170px] bg-[#F8F1EC] flex items-center justify-center text-4xl">🎁</div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase text-[#D90452]">
                        {product.category?.name || product.categoryName || product.category}
                      </p>
                      <h3 className="font-black text-sm sm:text-base mt-2 leading-snug min-h-[42px]">
                        {product.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-[#D90452] font-black">${product.price}</p>
                        <span className={`text-xs font-black ${stock > 0 ? "text-green-600" : "text-[#D90452]"}`}>
                          Stock: {stock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-5">
          {/* Inventory Alerts */}
          <div className="bg-white rounded-[28px] lg:rounded-[32px] p-5 lg:p-7 border border-[#EFE4DF]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F8E7EC] text-[#D90452] flex items-center justify-center text-xl">
                <FiAlertCircle />
              </div>
              <div>
                <h2 className="font-black text-lg">Inventory Alerts</h2>
                <p className="text-sm text-[#7A7272]">Products needing attention.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
                <p className="text-sm text-[#7A7272]">Everything looks good. ✓</p>
              ) : (
                <>
                  {outOfStockProducts.slice(0, 3).map((product) => (
                    <AlertItem
                      key={product.id}
                      title={product.title}
                      text="Out of stock"
                      type="out"
                    />
                  ))}
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <AlertItem
                      key={product.id}
                      title={product.title}
                      text={`Only ${product.stockCount ?? product.stock} left`}
                      type="low"
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Seller Tip */}
          <div className="bg-[#D90452] text-white rounded-[28px] lg:rounded-[32px] p-5 lg:p-7">
            <h2 className="text-xl lg:text-2xl font-black">Seller Tip</h2>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Products with personalized tags perform better in Gift Finder.
              Add recipient and occasion tags to improve discovery.
            </p>
            <Link
              to="/seller/add-product"
              className="inline-block mt-6 bg-white text-[#D90452] px-6 py-3 rounded-full font-black text-sm"
            >
              Add New Listing
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-white rounded-[24px] lg:rounded-[28px] p-5 lg:p-6 border border-[#EFE4DF]">
      <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-[#F8E7EC] text-[#D90452] flex items-center justify-center text-xl">
        {icon}
      </div>
      <p className="mt-5 text-[#7A7272] text-sm font-semibold">{title}</p>
      <h3 className="text-2xl lg:text-3xl font-black mt-2 text-[#1E1B1B]">{value}</h3>
      <p className="mt-2 text-sm text-[#A59B9B]">{subtitle}</p>
    </div>
  );
}

function AlertItem({ title, text, type }) {
  return (
    <div className="bg-[#F8F1EC] rounded-2xl p-4">
      <h3 className="font-black text-sm line-clamp-1">{title}</h3>
      <p className={`text-xs mt-1 font-bold ${type === "out" ? "text-[#D90452]" : "text-orange-500"}`}>
        {text}
      </p>
    </div>
  );
}

export default SellerDashboard;