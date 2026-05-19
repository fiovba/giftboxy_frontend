import { FiHeart, FiPackage, FiStar } from "react-icons/fi";

function AuthBuyerSide() {
  return (
    <div className="h-full bg-[#F8E7EC] p-12 flex flex-col justify-between">
      <div>
        <p className="text-[#D90452] font-black">GiftBoxy</p>

        <h2 className="mt-12 text-5xl font-black leading-tight">
          Start Your <span className="text-[#D90452]">Gift</span>
          <br />
          Journey
        </h2>

        <div className="mt-10 space-y-5">
          {[
            { icon: <FiHeart />, title: "Save favorites", text: "Keep track of items you love." },
            { icon: <FiPackage />, title: "Track orders", text: "Real-time shipping updates." },
            { icon: <FiStar />, title: "Exclusive Access", text: "Be first to know about drops." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D90452] text-white flex items-center justify-center">
                {item.icon}
              </div>

              <div>
                <h3 className="font-black text-sm">{item.title}</h3>
                <p className="text-xs text-[#7A7272] mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <img
        src="https://images.unsplash.com/photo-1517841905240-472988babdf9"
        className="rounded-[28px] h-[260px] object-cover shadow-lg"
      />
    </div>
  );
}

export default AuthBuyerSide;