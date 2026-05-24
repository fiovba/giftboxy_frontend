import { useEffect, useState } from "react";
import { useGiftFinder } from "../hooks/useGiftFinder";
import ChatPanel from "../components/giftFinder/ChatPanel";
import ProductsContent from "../components/giftFinder/ProductsContent";

function GiftFinder() {
  const [navbarH, setNavbarH] = useState(141);
  const giftFinder = useGiftFinder();

  useEffect(() => {
    const nav = document.getElementById("main-navbar");
    if (nav) setNavbarH(nav.offsetHeight);
  }, []);

  return (
    <div className="bg-linear-to-br from-[#FDF5F0] via-[#FFF8F5] to-[#FCE8EF]">
      {/* Mobile — single column, natural scroll */}
      <div className="lg:hidden flex flex-col gap-4 p-4 pb-10">
        <ChatPanel {...giftFinder} />
        {(giftFinder.lastParams || giftFinder.productsLoading) && (
          <div className="rounded-[28px] bg-white/80 border border-[#F5E0E8] shadow-[0_4px_20px_rgba(217,4,82,0.06)]">
            <ProductsContent {...giftFinder} />
          </div>
        )}
      </div>

      {/* Desktop — side-by-side, locked to viewport height */}
      <div
        className="hidden lg:flex gap-5 p-5 max-w-350 mx-auto w-full"
        style={{ height: `calc(100dvh - ${navbarH}px)` }}
      >
        <ChatPanel {...giftFinder} />

        <div className="flex-1 flex flex-col rounded-[28px] bg-white/70 border border-[#F5E0E8] shadow-[0_8px_40px_rgba(217,4,82,0.05)] overflow-hidden">
          {!giftFinder.lastParams && !giftFinder.productsLoading && <DesktopEmptyState />}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <ProductsContent {...giftFinder} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_TAGS = ["Jewelry 💍", "Home Decor 🏡", "Beauty ✨", "Personalized 🖊️"];

function DesktopEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-linear-to-br from-[#FF6B9E] to-[#D90452] rounded-[28px] flex items-center justify-center text-5xl shadow-lg anim-float">
          🎁
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-sm shadow">
          ✨
        </div>
      </div>
      <h2 className="text-2xl font-black text-[#1E1B1B]">Gift ideas appear here</h2>
      <p className="mt-2 text-[#A0918B] max-w-xs text-sm leading-relaxed">
        Chat with Giftie and I'll curate personalized gift recommendations just for you.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-70 w-full">
        {PREVIEW_TAGS.map((tag) => (
          <div
            key={tag}
            className="bg-white rounded-2xl border border-[#EFE4DF] px-4 py-3 text-xs font-bold text-[#A0918B] text-center shadow-sm"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GiftFinder;
