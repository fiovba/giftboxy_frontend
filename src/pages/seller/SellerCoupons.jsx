import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiTag } from "react-icons/fi";
import { couponService } from "../../services/couponService";

function SellerCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxUsageCount: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = () => {
    setLoading(true);
    couponService
      .getMyCoupons()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setCoupons(list);
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  };

  const resetForm = () =>
    setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUsageCount: "", expiresAt: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }
    setSubmitting(true);
    try {
      await couponService.createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxUsageCount: form.maxUsageCount ? Number(form.maxUsageCount) : null,
        expiresAt: form.expiresAt || null,
      });
      toast.success("Coupon created!");
      setShowForm(false);
      resetForm();
      loadCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await couponService.toggleCoupon(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    } catch {
      toast.error("Failed to update coupon.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await couponService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted.");
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  return (
    <div>
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Store</p>
      <div className="flex items-center justify-between mt-2 mb-6">
        <h1 className="text-4xl font-black">Coupons</h1>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="flex items-center gap-2 bg-[#D90452] text-white px-5 py-3 rounded-full font-black text-sm"
        >
          <FiPlus /> New Coupon
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-[28px] border border-[#EFE4DF] p-6 mb-6 grid sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Coupon Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER20"
              required
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Discount Type</label>
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="field mt-1"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">
              Discount Value {form.discountType === "percentage" ? "(%)" : "($)"}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              placeholder={form.discountType === "percentage" ? "20" : "10"}
              required
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Min Order Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
              placeholder="Optional"
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Max Usage Count</label>
            <input
              type="number"
              min="1"
              value={form.maxUsageCount}
              onChange={(e) => setForm({ ...form, maxUsageCount: e.target.value })}
              placeholder="Optional (unlimited)"
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Expires At</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="field mt-1"
            />
          </div>

          <div className="sm:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#D90452] text-white px-8 py-3 rounded-full font-black disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-8 py-3 rounded-full font-black border border-[#EFE4DF] text-[#7A7272]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-[#EFE4DF] p-16 text-center">
          <div className="w-16 h-16 bg-[#F8E7EC] rounded-full flex items-center justify-center mx-auto">
            <FiTag className="text-[#D90452]" size={28} />
          </div>
          <h3 className="mt-4 text-xl font-black">No coupons yet</h3>
          <p className="mt-2 text-sm text-[#7A7272]">Create your first coupon to offer discounts to buyers.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-[24px] border border-[#EFE4DF] p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-[#F8E7EC] rounded-[16px] flex items-center justify-center flex-shrink-0">
                <FiTag className="text-[#D90452]" size={22} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-black text-lg tracking-wider">{coupon.code}</p>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-[#7A7272] mt-0.5">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% off`
                    : `$${coupon.discountValue} off`}
                  {coupon.minOrderAmount ? ` · Min $${coupon.minOrderAmount}` : ""}
                  {coupon.maxUsageCount ? ` · Max ${coupon.maxUsageCount} uses` : ""}
                  {coupon.expiresAt
                    ? ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`
                    : ""}
                </p>
                {coupon.usageCount != null && (
                  <p className="text-xs text-[#D90452] font-bold mt-0.5">{coupon.usageCount} uses so far</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(coupon.id)}
                  title={coupon.isActive ? "Deactivate" : "Activate"}
                  className={`px-4 py-2 rounded-full text-xs font-black border transition ${
                    coupon.isActive
                      ? "border-green-300 text-green-700 hover:bg-green-50"
                      : "border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {coupon.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2.5 rounded-xl hover:bg-red-50 transition text-red-400 hover:text-red-600"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerCoupons;
