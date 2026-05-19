import { Link } from "react-router-dom";
import { FiShield, FiTruck, FiGift, FiHeart } from "react-icons/fi";

function HeroSection() {
  return (
    <section className="bg-[#F5F2EF] px-5 lg:px-10 pt-10 pb-16">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex bg-white text-[#D90452] text-[11px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            Made with love. Given with heart.
          </div>

          <h1 className="mt-5 text-[48px] md:text-[72px] font-black leading-[0.9] tracking-tight text-[#1E1B1B]">
            <span className="block">Make Every</span>
            <span className="block">Moment</span>
            <span
              className="block text-[#D90452] italic "
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              Unforgettable
            </span>
          </h1>

          <p className="mt-5 text-[#7A7272] max-w-xl text-base leading-relaxed">
            Curating carefully handcrafted gifts that tell stories. Discover
            unique treasures from independent creators worldwide.
          </p>

          <div className="flex gap-4 mt-8">
            <Link
              to="/explore"
              className="bg-[#D90452] text-white px-8 py-4 rounded-full font-bold inline-flex items-center justify-center hover:bg-[#be0348] transition"
            >
              Start Exploring
            </Link>

            <Link
              to="/gift-finder"
              className="bg-white text-[#1E1B1B] px-7 py-4 rounded-full font-bold inline-flex items-center justify-center hover:bg-[#f7f2ef] transition"
            >
              🎁 Gift Finder
            </Link>
          </div>

          <div className="mt-8 bg-white text-[#1E1B1B] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] font-bold uppercase shadow-sm">
            <div className="flex items-center gap-2">
              <FiShield /> Secure
            </div>

            <div className="flex items-center gap-2">
              <FiTruck /> Fast Ship
            </div>

            <div className="flex items-center gap-2">
              <FiGift /> Eco Friendly
            </div>

            <div className="flex items-center gap-2">
              <FiHeart /> Unique
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 pt-12">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48"
              className="h-[260px] w-full object-cover rounded-[28px]"
              alt="gift"
            />

            <img
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0"
              className="h-[170px] w-full object-cover rounded-[28px]"
              alt="mugs"
            />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1512909006721-3d6018887383"
                className="h-[210px] w-full object-cover rounded-[28px]"
                alt="frames"
              />

              <div className="absolute -top-5 -right-4 w-24 h-24 bg-[#D90452] text-white rounded-full flex items-center justify-center text-center text-[10px] font-bold p-3 uppercase">
                Gifts that create memories
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9"
              className="h-[270px] w-full object-cover rounded-[28px]"
              alt="flowers"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;