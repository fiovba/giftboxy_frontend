import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import AuthInput from "../../components/auth/AuthInput";
import AuthTabs from "../../components/auth/AuthTabs";
import AuthSocialButtons from "../../components/auth/AuthSocialButtons";
import PasswordStrength from "../../components/auth/PasswordStrength";
import AuthBuyerSide from "../../components/auth/AuthBuyerSide";
import AuthLayout from "../../layouts/AuthLayout";

function RegisterBuyer() {
  const navigate = useNavigate();
  const { buyerRegister } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", acceptedTerms: false });
  const [errors, setErrors] = useState({ name: "", email: "", password: "", terms: "", general: "" });
  const [loading, setLoading] = useState(false);

  const interests = ["Jewelry", "Home Decor", "Artisanal Food", "Accessories", "Beauty"];
  const [selectedInterests, setSelectedInterests] = useState(["Jewelry"]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors((p) => ({ ...p, [name]: "", general: "" }));
  };

  const toggleInterest = (item) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const validate = () => {
    const newErrors = { name: "", email: "", password: "", terms: "", general: "" };
    let valid = true;

    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }
    if (!form.acceptedTerms) {
      newErrors.terms = "You must accept the Terms and Privacy Policy.";
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
      await buyerRegister({ name: form.name, email: form.email, password: form.password, interests: selectedInterests });
      toast.success("Account created! Please log in.");
      navigate("/login");
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

      const msg = data?.message || data?.title || "Registration failed. Please try again.";
      setErrors((p) => ({ ...p, general: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side={<AuthBuyerSide />}>
      <div className="flex items-center justify-between">
        <p className="text-[#D90452] font-black">GiftBoxy</p>
        <Link to="/" className="text-[#D90452] text-sm font-black">← Back to home page</Link>
      </div>

      <div className="mt-8">
        <AuthTabs />
      </div>

      <h1 className="mt-8 text-4xl font-black">Create Buyer Account</h1>
      <p className="mt-3 text-[#7A7272]">Join our curated marketplace of unique gifts.</p>

      <div className="mt-8">
        <AuthSocialButtons />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Full Name"
          icon={<FiUser />}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          error={errors.name}
        />

        <AuthInput
          label="Email Address"
          icon={<FiMail />}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          error={errors.email}
        />

        <AuthInput
          label="Password"
          icon={<FiLock />}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create password"
          error={errors.password}
        />

        <PasswordStrength password={form.password} />

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#6F6262] mb-3">
            Your Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => toggleInterest(item)}
                className={`px-4 py-2 rounded-full text-xs font-bold border ${
                  selectedInterests.includes(item)
                    ? "bg-[#D90452] text-white border-[#D90452]"
                    : "bg-white text-[#1E1B1B] border-[#EEE4DF]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 text-sm text-[#7A7272] cursor-pointer">
            <input
              type="checkbox"
              name="acceptedTerms"
              checked={form.acceptedTerms}
              onChange={handleChange}
              className="accent-[#D90452] w-4 h-4"
            />
            I agree to the Terms of Service and Privacy Policy.
          </label>
          {errors.terms && (
            <p className="mt-1.5 text-xs text-red-500 font-semibold pl-1">{errors.terms}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-sm text-red-500 font-semibold pl-1">{errors.general}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D90452] text-white py-4 rounded-full font-black shadow-lg shadow-pink-200 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#7A7272]">
        Already have an account?{" "}
        <Link to="/login" className="text-[#D90452] font-black">Log in here</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterBuyer;
