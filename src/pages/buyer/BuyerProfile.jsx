import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiMapPin, FiSave, FiPhone } from "react-icons/fi";

import { buyerProfileService } from "../../services/buyerProfileService";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function BuyerProfile() {
  const { getMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phoneNumber: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      let data;
      try {
        const res = await buyerProfileService.getBuyerProfile();
        data = res.data;
      } catch (err) {
        if (err?.response?.status === 404 || err?.response?.status === 405) {
          // Endpoint not yet available — fall back to auth/me
          const res = await authService.getMe();
          data = res.data;
        } else {
          throw err;
        }
      }
      setForm({
        name: data.name || data.fullName || "",
        email: data.email || "",
        location: data.location || "",
        phoneNumber: data.phoneNumber || data.phone || "",
      });
    } catch {
      toast.error("Profile could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await buyerProfileService.updateBuyerProfile({
        name: form.name,
        location: form.location,
        phoneNumber: form.phoneNumber,
      });
      await getMe();
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        // Endpoint not yet available on backend
        toast.error("Profile update is not available yet.");
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.title ||
          "Update failed.";
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
        Account
      </p>
      <h1 className="mt-2 text-4xl font-black">My Profile</h1>
      <p className="mt-2 text-[#7A7272]">Manage your account information.</p>

      <form
        onSubmit={handleSave}
        className="mt-8 bg-white rounded-[30px] border border-[#EFE4DF] p-6 space-y-5"
      >
        <Field label="Full Name" icon={<FiUser />}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full h-14 rounded-full border border-[#EFE4DF] bg-[#FCFAF8] pl-12 pr-4 outline-none"
          />
        </Field>

        <Field label="Email" icon={<FiMail />}>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full h-14 rounded-full border border-[#EFE4DF] bg-gray-100 pl-12 pr-4 outline-none text-[#9A9A9A]"
          />
        </Field>

        <Field label="Location" icon={<FiMapPin />}>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Baku, Azerbaijan"
            className="w-full h-14 rounded-full border border-[#EFE4DF] bg-[#FCFAF8] pl-12 pr-4 outline-none"
          />
        </Field>

        <Field label="Phone Number" icon={<FiPhone />}>
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="+994 50 000 00 00"
            className="w-full h-14 rounded-full border border-[#EFE4DF] bg-[#FCFAF8] pl-12 pr-4 outline-none"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-14 rounded-full bg-[#D90452] text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <FiSave />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262] block mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B7A9A2]">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

export default BuyerProfile;
