function AuthSocialButtons() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button className="border border-[#EEE4DF] rounded-full py-3 text-sm font-bold">
          Google
        </button>

        <button className="border border-[#EEE4DF] rounded-full py-3 text-sm font-bold">
          Apple ID
        </button>
      </div>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-[#EEE4DF] flex-1" />
        <span className="text-xs font-bold text-[#9A8C87]">OR CONTINUE WITH EMAIL</span>
        <div className="h-px bg-[#EEE4DF] flex-1" />
      </div>
    </>
  );
}

export default AuthSocialButtons;