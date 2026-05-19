import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiCamera, FiMapPin } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { sellerProfileService } from "../../services/sellerProfileService";
import { categoryService } from "../../services/categoryService";


const BASE_URL = import.meta.env.VITE_BASE_URL || "https://giftboxy-backend-1.onrender.com";

const getFullUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

function SellerProfile() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    storeName: "",
    avatarUrl: "",
    bio: "",
    location: "",
    shopUrl: "",
    categories: [],
  });

  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryService.getCategories()
      .then((cats) => setApiCategories(Array.isArray(cats) ? cats : []))
      .catch(() => setApiCategories([]));
  }, []);

  useEffect(() => {
    sellerProfileService.getMySellerProfile()
      .then((res) => {
        const data = res.data;
        setForm({
          storeName: data.storeName || "",
          avatarUrl: getFullUrl(data.avatar || data.avatarUrl),
          bio: data.bio || "",
          location: data.location || "",
          shopUrl: data.shopUrl || "",
          categories: Array.isArray(data.categories) ? data.categories : [],
        });
      })
      .catch(() => toast.error("Profile data could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleCategory = (name) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(name)
        ? prev.categories.filter((x) => x !== name)
        : [...prev.categories, name],
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await sellerProfileService.uploadAvatar(file);
      const url = res.data?.avatarUrl || res.data?.avatar || res.data?.url || res.data;
      if (typeof url === "string") {
        setForm((prev) => ({ ...prev, avatarUrl: getFullUrl(url) }));
      }
      toast.success("Avatar updated.");
    } catch {
      toast.error("Avatar upload failed.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sellerProfileService.updateMySellerProfile({
        storeName: form.storeName,
        shopUrl: form.shopUrl,
        bio: form.bio,
        location: form.location,
        categories: form.categories,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Profile could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out.");
    navigate("/");
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
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
        Seller Profile
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl font-black">Edit Profile</h1>
      <p className="mt-2 text-[#7A7272] text-sm">
        Update your seller account, store information and profile image.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-8">
        <form
          onSubmit={handleSave}
          className="bg-white rounded-[28px] p-5 sm:p-7 border border-[#EFE4DF] grid sm:grid-cols-2 gap-5"
        >
          <Input
            label="Full Name"
            name="name"
            value={user?.name || user?.fullName || ""}
            disabled
          />

          <Input
            label="Store Name"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            placeholder="Jane Handmade Studio"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={user?.email || ""}
            disabled
          />

          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Baku, Azerbaijan"
          />

          <Input
            label="Shop URL"
            name="shopUrl"
            value={form.shopUrl}
            onChange={handleChange}
            placeholder="giftboxy.com/shop/yourbrand"
          />

          <div className="sm:col-span-2">
            <Label>Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {apiCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition ${form.categories.includes(cat.name)
                      ? "bg-[#D90452] text-white border-[#D90452]"
                      : "bg-white text-[#1E1B1B] border-[#EEE4DF] hover:border-[#D90452]"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label>Bio</Label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell customers about your shop..."
              className="field h-[120px] resize-none mt-1"
            />
          </div>

          <button
            disabled={saving}
            className="sm:col-span-2 bg-[#D90452] text-white py-4 rounded-full font-black disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <aside className="space-y-5">
          <div className="bg-white rounded-[28px] p-6 border border-[#EFE4DF] text-center">
            <div className="relative inline-block">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={user?.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mx-auto border-4 border-[#F8E7EC]"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#F8E7EC] flex items-center justify-center mx-auto text-4xl border-4 border-white shadow">
                  👤
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 w-9 h-9 bg-[#D90452] text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-60"
              >
                {avatarUploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiCamera size={14} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="mt-4 text-xl font-black">
              {form.storeName || "Your Store"}
            </h2>
            <p className="text-sm text-[#7A7272] mt-1">
              {user?.name || user?.fullName || "Seller Name"}
            </p>

            {form.location && (
              <p className="text-xs text-[#7A7272] mt-2 flex items-center justify-center gap-1">
                <FiMapPin size={11} /> {form.location}
              </p>
            )}

            {form.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {form.categories.slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="bg-[#F8F1EC] text-[#D90452] text-[10px] font-black px-3 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {form.bio && (
              <p className="mt-3 text-xs text-[#7A7272] leading-relaxed line-clamp-3">
                {form.bio}
              </p>
            )}
          </div>

          <div className="bg-white rounded-[28px] p-5 border border-[#EFE4DF]">
            <h3 className="font-black text-lg">Account Actions</h3>

            <Link
              to="/seller/change-password"
              className="mt-4 w-full bg-[#F8F1EC] text-[#1E1B1B] py-3.5 rounded-full font-black text-sm text-center block"
            >
              Change Password
            </Link>

            
          </div>
        </aside>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262]">
      {children}
    </label>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        className="field mt-1 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-[#7A7272]"
      />
    </div>
  );
}

export default SellerProfile;