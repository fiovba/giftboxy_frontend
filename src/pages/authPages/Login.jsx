import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthSocialButtons from "../../components/auth/AuthSocialButtons";

function Login() {
  const navigate = useNavigate();

  const { buyerLogin, sellerLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "buyer",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let loggedUser;

      if (form.role === "seller") {
        loggedUser = await sellerLogin({
          email: form.email,
          password: form.password,
        });

        toast.success(
          `Xoş gəldiz, ${loggedUser.fullName || loggedUser.name}`
        );

        navigate("/seller/dashboard");
      } else {
        loggedUser = await buyerLogin({
          email: form.email,
          password: form.password,
        });

        toast.success(
          `Xoş gəldiz, ${loggedUser.fullName || loggedUser.name}`
        );

        navigate("/");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          error.message ||
          "Login failed"
      );
    }
  };

  return (
    <AuthLayout
      side={
        <div className="h-full bg-[#F8E7EC] p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <p className="text-[#D90452] font-black text-xl">
              GiftBoxy
            </p>

            <h1 className="mt-10 lg:mt-16 text-4xl lg:text-5xl font-black leading-tight text-[#111]">
              Welcome back to
              <br />
              meaningful
              <br />
              gifting.
            </h1>

            <p className="mt-6 text-[#7A7272] max-w-sm leading-relaxed text-sm lg:text-base">
              Save gifts, message sellers and continue your
              personalized shopping journey.
            </p>
          </div>

          <img
            src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48"
            alt="Gift"
            className="rounded-[28px] h-[220px] lg:h-[280px] w-full object-cover mt-10"
          />
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-[#D90452] font-black text-lg">
          GiftBoxy
        </p>

        <Link
          to="/"
          className="text-[#D90452] text-sm font-black"
        >
          ← Back to home page
        </Link>
      </div>

      <div className="mt-10 lg:mt-16">
        <p className="text-[#D90452] text-xs font-black uppercase tracking-[0.3em]">
          Sign In
        </p>

        <h2 className="mt-4 text-4xl lg:text-5xl font-black leading-tight">
          Login to
          <br />
          GiftBoxy
        </h2>
      </div>

      {/* ROLE SWITCH */}
      <div className="mt-8 bg-[#F8F1EC] rounded-full p-1 grid grid-cols-2">
        <button
          type="button"
          onClick={() =>
            setForm({
              ...form,
              role: "buyer",
            })
          }
          className={`py-3 rounded-full font-black transition ${
            form.role === "buyer"
              ? "bg-[#D90452] text-white"
              : "text-[#6F6262]"
          }`}
        >
          Buyer
        </button>

        <button
          type="button"
          onClick={() =>
            setForm({
              ...form,
              role: "seller",
            })
          }
          className={`py-3 rounded-full font-black transition ${
            form.role === "seller"
              ? "bg-[#D90452] text-white"
              : "text-[#6F6262]"
          }`}
        >
          Seller
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <AuthInput
          label="Email"
          icon={<FiMail />}
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="emily@example.com"
        />

        <AuthInput
          label="Password"
          icon={<FiLock />}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="123456"
        />

        <button className="w-full bg-[#D90452] text-white py-4 rounded-full font-black shadow-lg shadow-pink-200 hover:scale-[1.01] transition">
          Sign In
        </button>
      </form>

      <div className="mt-8">
        <AuthSocialButtons />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <Link
          to="/register-buyer"
          className="bg-[#F8E7EC] text-[#D90452] py-4 rounded-full text-center font-black hover:opacity-90 transition"
        >
          Buyer Register
        </Link>

        <Link
          to="/register-seller"
          className="bg-[#1E1B1B] text-white py-4 rounded-full text-center font-black hover:opacity-90 transition"
        >
          Seller Register
        </Link>
      </div>

      <p className="mt-6 text-xs text-[#7A7272] leading-relaxed">
        Buyer login → buyer endpoint
        <br />
        Seller login → seller endpoint
      </p>
    </AuthLayout>
  );
}

export default Login;