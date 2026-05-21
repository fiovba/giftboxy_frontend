import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiBriefcase, FiGlobe, FiEdit3, FiMapPin } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import AuthInput from "../../components/auth/AuthInput";
import AuthTabs from "../../components/auth/AuthTabs";
import AuthSellerSide from "../../components/auth/AuthSellerSide";
import AuthLayout from "../../layouts/AuthLayout";

const passwordRulesList = [
  { label: "Minimum 6 characters", test: (p) => p.length >= 6 },
  { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "At least 1 lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "At least 1 number", test: (p) => /[0-9]/.test(p) },
];

function RegisterSeller() {
  const navigate = useNavigate();
  const { sellerRegister } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    storeName: "",
    email: "",
    password: "",
    bio: "",
    location: "",
    shopUrl: "",
    categories: ["Handmade Jewelry"],
  });

  const [errors, setErrors] = useState({
    fullName: "", storeName: "", email: "", password: "", general: "",
  });
  const [loading, setLoading] = useState(false);

  const sellerCategories = [
    "Handmade Jewelry", "Home Decor", "Eco-Friendly",
    "Personalized", "Art Prints", "Vintage",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((p) => ({ ...p, [e.target.name]: "", general: "" }));
  };

  const toggleCategory = (item) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(item)
        ? prev.categories.filter((x) => x !== item)
        : [...prev.categories, item],
    }));
  };

  const validate = () => {
    const newErrors = { fullName: "", storeName: "", email: "", password: "", general: "" };
    let valid = true;

    if (!form.fullName.trim()) { newErrors.fullName = "Owner name is required."; valid = false; }
    if (!form.storeName.trim()) { newErrors.storeName = "Shop name is required."; valid = false; }
    if (!form.email.trim()) { newErrors.email = "Email is required."; valid = false; }

    const failedRule = passwordRulesList.find((r) => !r.test(form.password));
    if (failedRule) {
      newErrors.password = failedRule.label + " is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await sellerRegister(form);
      toast.success("Seller account created. Please login.");
      navigate("/login?role=seller");
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 409 || (typeof data === "string" && data.toLowerCase().includes("exist"))) {
        setErrors((p) => ({ ...p, email: "An account with this email already exists." }));
        return;
      }

      if (Array.isArray(data)) {
        const desc = data[0]?.description || "";
        if (desc.toLowerCase().includes("email")) {
          setErrors((p) => ({ ...p, email: desc }));
        } else if (desc.toLowerCase().includes("password")) {
          setErrors((p) => ({ ...p, password: desc }));
        } else {
          setErrors((p) => ({ ...p, general: desc || "Registration failed." }));
        }
        return;
      }

      const msg = data?.title || data?.message || "Registration failed. Please try again.";
      setErrors((p) => ({ ...p, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side={<AuthSellerSide />}>
      <div className="flex items-center justify-between">
        <p className="text-[#D90452] font-black">GiftBoxy</p>
        <Link to="/" className="text-[#D90452] text-sm font-black">← Back to home page</Link>
      </div>

      <div className="mt-8">
        <AuthTabs />
      </div>

      <h1 className="mt-8 text-4xl font-black">Shop Setup</h1>
      <p className="mt-3 text-[#7A7272]">Create your seller profile and start listing your gifts.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <AuthInput
          label="Owner Name"
          icon={<FiUser />}
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
          error={errors.fullName}
        />

        <AuthInput
          label="Shop Name"
          icon={<FiBriefcase />}
          name="storeName"
          value={form.storeName}
          onChange={handleChange}
          placeholder="The Crafty Corner"
          error={errors.storeName}
        />

        <AuthInput
          label="Email"
          icon={<FiMail />}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seller@example.com"
          error={errors.email}
        />

        <AuthInput
          label="Password"
          icon={<FiLock />}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Example: Seller123"
          error={errors.password}
        />

        {/* Password rules */}
        <div className="bg-[#FFF6F8] border border-pink-100 rounded-3xl p-4">
          <p className="text-xs font-black text-[#D90452] uppercase tracking-widest mb-3">
            Password Requirements
          </p>
          <ul className="space-y-2 text-sm">
            {passwordRulesList.map((rule) => {
              const valid = rule.test(form.password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 font-semibold ${valid ? "text-green-600" : "text-[#8B7C77]"}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      valid ? "bg-green-100 text-green-600" : "bg-[#F1E8E3] text-[#8B7C77]"
                    }`}
                  >
                    {valid ? "✓" : "•"}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <AuthInput
          label="Bio"
          icon={<FiEdit3 />}
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Tell buyers about your brand"
        />

        <AuthInput
          label="Location"
          icon={<FiMapPin />}
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Baku, Azerbaijan"
        />

        <AuthInput
          label="Shop URL"
          icon={<FiGlobe />}
          name="shopUrl"
          value={form.shopUrl}
          onChange={handleChange}
          placeholder="giftboxy.com/shop/yourbrand"
        />

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#6F6262] mb-3">
            Basic Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {sellerCategories.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => toggleCategory(item)}
                className={`px-4 py-2 rounded-full text-xs font-bold border ${
                  form.categories.includes(item)
                    ? "bg-[#D90452] text-white border-[#D90452]"
                    : "bg-white text-[#1E1B1B] border-[#EEE4DF]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {errors.general && (
          <p className="text-sm text-red-500 font-semibold pl-1">{errors.general}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D90452] text-white py-4 rounded-full font-black disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Continue →"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7A7272]">
        Already have an account?{" "}
        <Link to="/login" className="text-[#D90452] font-black">Log in here</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterSeller;
