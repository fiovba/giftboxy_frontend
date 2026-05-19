function SellerStats({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-[28px] p-6 border border-[#F0E5E0]">
      <p className="text-[#7A7272] text-sm font-semibold">
        {title}
      </p>

      <h3 className="text-4xl font-black mt-4 text-[#1E1B1B]">
        {value}
      </h3>

      <p className="mt-3 text-sm text-[#A59B9B]">
        {subtitle}
      </p>
    </div>
  );
}

export default SellerStats;