import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiGlobe,
  FiEdit3,
  FiMapPin,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import AuthInput from "../../components/auth/AuthInput";
import AuthTabs from "../../components/auth/AuthTabs";
import AuthSellerSide from "../../components/auth/AuthSellerSide";
import AuthLayout from "../../layouts/AuthLayout";

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

  const sellerCategories = [
    "Handmade Jewelry",
    "Home Decor",
    "Eco-Friendly",
    "Personalized",
    "Art Prints",
    "Vintage",
  ];

  const passwordRules = [
    {
      label: "Minimum 6 characters",
      valid: form.password.length >= 6,
    },
    {
      label: "At least 1 uppercase letter",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "At least 1 lowercase letter",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "At least 1 number",
      valid: /[0-9]/.test(form.password),
    },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCategory = (item) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(item)
        ? prev.categories.filter((x) => x !== item)
        : [...prev.categories, item],
    }));
  };

  const validatePassword = () => {
    if (form.password.length < 6) {
      toast.error("Password minimum 6 simvol olmalıdır.");
      return false;
    }

    if (!/[A-Z]/.test(form.password)) {
      toast.error("Password ən azı 1 böyük hərf içərməlidir.");
      return false;
    }

    if (!/[a-z]/.test(form.password)) {
      toast.error("Password ən azı 1 kiçik hərf içərməlidir.");
      return false;
    }

    if (!/[0-9]/.test(form.password)) {
      toast.error("Password ən azı 1 rəqəm içərməlidir.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      await sellerRegister(form);

      toast.success("Seller account created. Please login.");
      navigate("/login?role=seller");
    } catch (error) {
      console.log(error.response?.data);

      if (Array.isArray(error.response?.data)) {
        toast.error(error.response.data[0]?.description || "Register failed");
        return;
      }

      toast.error(
        error?.response?.data?.title ||
        error?.response?.data?.message ||
        "Register failed"
      );
    }
  };

  return (
    <AuthLayout side={<AuthSellerSide />}>
      <div className="flex items-center justify-between">
        <p className="text-[#D90452] font-black">GiftBoxy</p>

        <Link to="/" className="text-[#D90452] text-sm font-black">
          ← Back to home page
        </Link>
      </div>

      <div className="mt-8">
        <AuthTabs />
      </div>

      <h1 className="mt-8 text-4xl font-black">Shop Setup</h1>

      <p className="mt-3 text-[#7A7272]">
        Create your seller profile and start listing your gifts.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <AuthInput
          label="Owner Name"
          icon={<FiUser />}
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Jane Doe"
        />

        <AuthInput
          label="Shop Name"
          icon={<FiBriefcase />}
          name="storeName"
          value={form.storeName}
          onChange={handleChange}
          placeholder="The Crafty Corner"
        />

        <AuthInput
          label="Email"
          icon={<FiMail />}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seller@example.com"
        />

        <AuthInput
          label="Password"
          icon={<FiLock />}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Example: Seller123"
        />

        <div className="bg-[#FFF6F8] border border-pink-100 rounded-3xl p-4">
          <p className="text-xs font-black text-[#D90452] uppercase tracking-widest mb-3">
            Password Requirements
          </p>

          <ul className="space-y-2 text-sm">
            {passwordRules.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-2 font-semibold ${rule.valid ? "text-green-600" : "text-[#8B7C77]"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${rule.valid
                      ? "bg-green-100 text-green-600"
                      : "bg-[#F1E8E3] text-[#8B7C77]"
                    }`}
                >
                  {rule.valid ? "✓" : "•"}
                </span>

                {rule.label}
              </li>
            ))}
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
                className={`px-4 py-2 rounded-full text-xs font-bold border ${form.categories.includes(item)
                    ? "bg-[#D90452] text-white border-[#D90452]"
                    : "bg-white text-[#1E1B1B] border-[#EEE4DF]"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-[#D90452] text-white py-4 rounded-full font-black">
          Continue →
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7A7272]">
        Already have an account?{" "}
        <Link to="/login" className="text-[#D90452] font-black">
          Log in here
        </Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterSeller;