function AuthSellerSide() {
  return (
    <div className="h-full bg-[#D90452] text-white p-12 flex flex-col justify-between">
      <div>
        <p className="font-black">GiftBoxy</p>

       <h2 className="mt-8 text-[56px] leading-[0.95] font-black">
          Turn Your
          <br />
          Creativity
          <br />
          Into Income
        </h2>

       <p className="mt-5 text-white/80 max-w-[320px] text-sm leading-relaxed">
          Join talented creators and artisans selling thoughtful gifts worldwide.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white/15 backdrop-blur rounded-3xl p-6">
          <h3 className="text-3xl font-black">500+</h3>
          <p className="text-xs uppercase text-white/70">Approved sellers</p>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-3xl p-6">
          <h3 className="text-3xl font-black">50,000+</h3>
          <p className="text-xs uppercase text-white/70">Gifts discovered</p>
        </div>
      </div>
    </div>
  );
}

export default AuthSellerSide;