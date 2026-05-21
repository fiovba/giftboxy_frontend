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
    discountPercent: "",
    minimumAmount: "",
    usageLimit: "",
    expiryDate: "",
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
    setForm({ code: "", discountPercent: "", minimumAmount: "", usageLimit: "", expiryDate: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountPercent) {
      toast.error("Code and discount percent are required.");
      return;
    }
    setSubmitting(true);
    try {
      await couponService.createCoupon({
        code: form.code,
        discountPercent: Number(form.discountPercent),
        minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        isActive: true,
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

  const performDelete = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted.");
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  const handleDelete = (id) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-[20px] shadow-xl border border-[#EFE4DF] px-5 py-4 flex items-center gap-4">
          <p className="text-sm font-bold text-[#1E1B1B] flex-1">Delete this coupon?</p>
          <button
            onClick={() => { toast.dismiss(t.id); performDelete(id); }}
            className="bg-[#D90452] text-white px-4 py-2 rounded-full text-xs font-black"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-[#F8F1EC] text-[#7A7272] px-4 py-2 rounded-full text-xs font-black"
          >
            Cancel
          </button>
        </div>
      ),
      { duration: 6000 }
    );
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
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Discount (%)</label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              placeholder="20"
              required
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Minimum Order Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minimumAmount}
              onChange={(e) => setForm({ ...form, minimumAmount: e.target.value })}
              placeholder="Optional (0 = no minimum)"
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Usage Limit</label>
            <input
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              placeholder="Optional (0 = unlimited)"
              className="field mt-1"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
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
                  {coupon.discountPercent != null ? `${coupon.discountPercent}% off` : ""}
                  {coupon.minimumAmount ? ` · Min $${coupon.minimumAmount}` : ""}
                  {coupon.usageLimit ? ` · Limit ${coupon.usageLimit} uses` : ""}
                  {coupon.expiryDate
                    ? ` · Expires ${new Date(coupon.expiryDate).toLocaleDateString()}`
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
