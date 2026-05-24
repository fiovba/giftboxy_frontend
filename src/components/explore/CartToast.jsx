function CartToast({ t, image, title }) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-[20px] shadow-2xl border border-[#EFE4DF] px-4 py-3 min-w-[240px] max-w-[320px] ${
        t.visible ? "toast-enter" : "toast-leave"
      }`}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="w-11 h-11 rounded-[12px] object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-11 h-11 rounded-[12px] bg-[#F8E7EC] flex items-center justify-center flex-shrink-0 text-lg">
          🛒
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-black text-[#1E1B1B] text-sm">Added to cart!</p>
        <p className="text-xs text-[#7A7272] truncate mt-0.5">{title}</p>
      </div>
      <div className="w-7 h-7 bg-[#D90452] rounded-full flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
          <path
            d="M1 5l3 3 7-7"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default CartToast;
