import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";



import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function ChangePassword() {
  const navigate = useNavigate();
  const { isSeller } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    general: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setErrors({
      ...errors,
      [e.target.name]: "",
      general: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      general: "",
    };

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required.";
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters.";
    } else if (!/[A-Z]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 uppercase letter.";
    } else if (!/[a-z]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 lowercase letter.";
    } else if (!/[0-9]/.test(form.newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 number.";
    }

    if (!form.confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = "Confirm password is required.";
    } else if (form.newPassword !== form.confirmNewPassword) {
      newErrors.confirmNewPassword = "New passwords do not match.";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmNewPassword: form.confirmNewPassword,
      });

      toast.success("Password changed successfully!");
      navigate(isSeller ? "/seller/profile" : "/profile");
    } catch (e) {
      const data = e?.response?.data;

      if (Array.isArray(data)) {
        setErrors((prev) => ({
          ...prev,
          general: data[0]?.description || "Could not change password.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general:
            data?.message ||
            data?.title ||
            "Could not change password.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-[30px] p-8 w-full max-w-md border border-[#EFE4DF]">
        <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
          Security
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Change Password
        </h1>

        <p className="mt-2 text-sm text-[#7A7272]">
          Update your account password.
        </p>

        {errors.general && (
          <div className="mt-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-[16px] p-4 text-sm text-red-600">
            <FiAlertCircle className="mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            show={show.currentPassword}
            error={errors.currentPassword}
            placeholder="Enter current password"
            onChange={handleChange}
            onToggle={() =>
              setShow({
                ...show,
                currentPassword: !show.currentPassword,
              })
            }
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            show={show.newPassword}
            error={errors.newPassword}
            placeholder="Enter new password"
            onChange={handleChange}
            onToggle={() =>
              setShow({
                ...show,
                newPassword: !show.newPassword,
              })
            }
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            show={show.confirmNewPassword}
            error={errors.confirmNewPassword}
            placeholder="Confirm new password"
            onChange={handleChange}
            onToggle={() =>
              setShow({
                ...show,
                confirmNewPassword: !show.confirmNewPassword,
              })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-[#D90452] text-white py-4 rounded-full font-black disabled:opacity-60"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  show,
  error,
  placeholder,
  onChange,
  onToggle,
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6F6262]">
        {label}
      </label>

      <div
        className={`mt-1 flex items-center gap-3 rounded-full px-5 py-4 border ${
          error
            ? "bg-red-50 border-red-200"
            : "bg-[#F8F1EC] border-transparent"
        }`}
      >
        <FiLock className="text-[#D90452]" size={16} />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-transparent outline-none text-sm flex-1"
        />

        <button
          type="button"
          onClick={onToggle}
          className="text-[#7A7272] hover:text-[#D90452]"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 font-semibold">
          {error}
        </p>
      )}
    </div>
  );
}

export default ChangePassword;