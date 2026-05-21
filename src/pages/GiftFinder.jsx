import { useState } from "react";
import { FiZap, FiList } from "react-icons/fi";
import GiftQuestionCard from "../components/giftFinder/GiftQuestionCard";
import GiftRecommendations from "../components/giftFinder/GiftRecommendations";
import AIGiftChat from "../components/giftFinder/AIGiftChat";

function GiftFinder() {
  const [mode, setMode] = useState("ai"); // "ai" | "steps"

  return (
    <div className="min-h-screen bg-[#F5F2EF] text-[#1E1B1B]">
      <section className="px-5 lg:px-10 py-10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="inline-flex bg-[#F8DCE5] text-[#D90452] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            GiftBoxy Assistant
          </p>

          <h1 className="mt-5 text-4xl lg:text-5xl font-black leading-tight">
            Find the Perfect Gift
            <br />
            in <span className="text-[#D90452]">60 Seconds 🎁</span>
          </h1>

          <p className="mt-4 text-[#7A7272] max-w-xl mx-auto">
            Describe who you&apos;re shopping for in your own words, or answer a few quick questions.
          </p>

          {/* Mode toggle */}
          <div className="mt-8 inline-flex bg-white rounded-full p-1 border border-[#EFE4DF] shadow-sm">
            <button
              onClick={() => setMode("ai")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition ${
                mode === "ai"
                  ? "bg-[#D90452] text-white shadow"
                  : "text-[#7A7272] hover:text-[#1E1B1B]"
              }`}
            >
              <FiZap size={14} />
              AI Mode
            </button>
            <button
              onClick={() => setMode("steps")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-sm transition ${
                mode === "steps"
                  ? "bg-[#D90452] text-white shadow"
                  : "text-[#7A7272] hover:text-[#1E1B1B]"
              }`}
            >
              <FiList size={14} />
              Quick Questions
            </button>
          </div>

          {/* AI Mode */}
          {mode === "ai" && (
            <div className="anim-fade-up">
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-xs text-[#7A7272] font-bold">Powered by Google Gemini AI</p>
              </div>
              <AIGiftChat />
            </div>
          )}

          {/* Steps Mode */}
          {mode === "steps" && (
            <div className="anim-fade-up">
              <GiftQuestionCard />
            </div>
          )}
        </div>
      </section>

      {mode === "steps" && <GiftRecommendations />}
    </div>
  );
}

export default GiftFinder;
