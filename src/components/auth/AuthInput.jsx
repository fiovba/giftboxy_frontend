function AuthInput({ label, icon, type = "text", name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">
        {label}
      </label>

      <div className="mt-2 bg-[#F8F1EC] rounded-full px-5 py-4 flex items-center gap-3">
        <span className="text-[#9A8C87]">{icon}</span>

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-sm text-[#1E1B1B]"
          required
        />
      </div>
    </div>
  );
}

export default AuthInput;