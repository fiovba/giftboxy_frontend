function AuthInput({ label, icon, type = "text", name, value, onChange, placeholder, error }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">
        {label}
      </label>

      <div
        className={`mt-2 bg-[#F8F1EC] rounded-full px-5 py-4 flex items-center gap-3 transition ${
          error ? "ring-2 ring-red-400 bg-red-50" : ""
        }`}
      >
        <span className={error ? "text-red-400" : "text-[#9A8C87]"}>{icon}</span>

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

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-semibold pl-4">{error}</p>
      )}
    </div>
  );
}

export default AuthInput;
