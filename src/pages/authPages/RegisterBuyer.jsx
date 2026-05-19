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

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    acceptedTerms: false,
  });

  const interests = ["Jewelry", "Home Decor", "Artisanal Food", "Accessories", "Beauty"];
  const [selectedInterests, setSelectedInterests] = useState(["Jewelry"]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleInterest = (item) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.acceptedTerms) {
      toast.error("Please accept Terms and Privacy Policy.");
      return;
    }

    try {
      await buyerRegister({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (error) {
      if (Array.isArray(error.response?.data)) {
        toast.error(error.response.data[0]?.description || "Registration failed.");
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          error?.response?.data ||
          "Registration failed."
      );
    }
  };

  return (
    <AuthLayout side={<AuthBuyerSide />}>
      <div className="flex items-center justify-between">
        <p className="text-[#D90452] font-black">GiftBoxy</p>
        <Link to="/" className="text-[#D90452] text-sm font-black">
          ← Back to home page
        </Link>
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
        />

        <AuthInput
          label="Email Address"
          icon={<FiMail />}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="jane@example.com"
        />

        <AuthInput
          label="Password"
          icon={<FiLock />}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create password"
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

        <button
          type="submit"
          className="w-full bg-[#D90452] text-white py-4 rounded-full font-black shadow-lg shadow-pink-200"
        >
          Create Account
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

export default RegisterBuyer;