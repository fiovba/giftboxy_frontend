import { FiArrowRight, FiHeart, FiUsers, FiStar, FiGift } from "react-icons/fi";

function GiftFinderSection() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 py-14">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.3fr_0.9fr] gap-7">
        
        <div className="bg-[#F9DDE5] rounded-[28px] p-8 lg:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight text-[#1E1B1B]">
              Let GiftBoxy Find the Perfect Gift for You 🎁
            </h2>

            <button className="mt-8 bg-[#D90452] text-white px-7 py-4 rounded-full font-bold flex items-center gap-2">
              Try Gift Finder <FiArrowRight />
            </button>
          </div>

          <div className="bg-[#F8F4FF] border-[10px] border-black rounded-[34px] p-5 shadow-xl max-w-[250px] mx-auto">
            <h3 className="font-bold text-sm mb-4">Gift Finder</h3>

            <p className="text-xs font-semibold mb-3">Who is the gift for?</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { text: "Mom", icon: <FiHeart /> },
                { text: "Dad", icon: <FiUsers /> },
                { text: "Partner", icon: <FiHeart /> },
                { text: "Friend", icon: <FiStar /> },
                { text: "Kids", icon: <FiGift /> },
                { text: "Other", icon: <FiUsers /> },
              ].map((item) => (
                <div
                  key={item.text}
                  className="bg-white rounded-xl p-2 text-center text-[10px] shadow-sm"
                >
                  <div className="text-[#D90452] flex justify-center mb-1">
                    {item.icon}
                  </div>
                  {item.text}
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold mt-5 mb-2">
              What's the occasion?
            </p>

            <div className="bg-white rounded-full px-4 py-3 text-[10px] text-gray-400">
              e.g. Birthday, Anniversary...
            </div>

            <button className="mt-6 w-full bg-[#7A2CFF] text-white rounded-xl py-3 text-xs font-bold">
              Find My Gift ✨
            </button>
          </div>
        </div>

        <div className="grid gap-7">
          <div className="bg-[#F4EDE8] rounded-[28px] p-8 relative overflow-hidden min-h-[210px]">
            <div className="relative z-10 max-w-[250px]">
              <h3 className="text-2xl font-black">Become a Seller</h3>
              <p className="text-[#7A7272] mt-3 text-sm">
                Join our community of independent artisans.
              </p>
              <button className="mt-4 text-[#D90452] font-bold underline">
                Start Selling
              </button>
            </div>

            <div className="absolute right-[-10px] bottom-[-20px] w-36 h-36 rounded-full bg-[#222] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                alt="seller"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>

          <div className="bg-[#F4EDE8] rounded-[28px] p-8 relative overflow-hidden min-h-[210px]">
            <div className="relative z-10 max-w-[250px]">
              <h3 className="text-2xl font-black">Shop as a Buyer</h3>
              <p className="text-[#7A7272] mt-3 text-sm">
                Discover exclusive collections curated for you.
              </p>
              <button className="mt-4 text-[#D90452] font-bold underline">
                Explore Now
              </button>
            </div>

            <div className="absolute right-[-10px] bottom-[-20px] w-36 h-36 rounded-full bg-[#222] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="buyer"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiftFinderSection;