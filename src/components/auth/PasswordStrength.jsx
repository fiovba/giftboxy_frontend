function PasswordStrength({ password }) {
  const strength = password.length >= 8 ? 100 : password.length >= 5 ? 65 : password.length >= 1 ? 35 : 0;

  return (
    <div className="mt-3">
      <div className="h-1.5 bg-[#F0E5E1] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D90452] rounded-full transition-all"
          style={{ width: `${strength}%` }}
        />
      </div>

      <p className="text-right text-[10px] text-[#D90452] font-bold mt-1">
        {strength === 100 ? "STRONG" : strength >= 65 ? "GOOD" : "WEAK"}
      </p>
    </div>
  );
}

export default PasswordStrength;