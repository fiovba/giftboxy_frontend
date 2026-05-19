function AboutSection() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 py-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        <div className="relative">
          
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383"
            className="rounded-[28px] h-[520px] w-full object-cover"
          />

          <div className="absolute bottom-[-30px] right-[-10px] bg-[#D90452] rounded-[28px] w-[230px] h-[230px] p-8 flex flex-col justify-between text-white shadow-xl">
            
            <div className="text-3xl">♡</div>

            <div>
              <h3 className="text-3xl font-black leading-tight">
                SMALL GIFTS
                <br />
                BIG MEMORIES
              </h3>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[#D90452] text-sm font-bold uppercase tracking-widest">
            ♥ About Us ♥
          </p>

          <h2 className="mt-5 text-5xl font-black leading-tight text-[#1E1B1B]">
            Gifts for the moments that matter most.
          </h2>

          <p className="mt-7 text-[#7A7272] leading-relaxed text-lg">
            GiftBoxy was born out of a simple idea: every gift should be unique as the person receiving it. We partner with thousands of independent artists to bring you a collection that is soulful, sustainable, and intensely special.
          </p>

          <div className="border-t border-[#D9CBC6] mt-10 pt-10 grid grid-cols-3 gap-8">
            
            <div>
              <h3 className="text-[#D90452] text-3xl font-black">12k+</h3>
              <p className="text-xs text-[#7A7272] mt-2 uppercase">
                Artisans
              </p>
            </div>

            <div>
              <h3 className="text-[#D90452] text-3xl font-black">500k+</h3>
              <p className="text-xs text-[#7A7272] mt-2 uppercase">
                Gifts Sent
              </p>
            </div>

            <div>
              <h3 className="text-[#D90452] text-3xl font-black">4.9/5</h3>
              <p className="text-xs text-[#7A7272] mt-2 uppercase">
                Review Avg
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;