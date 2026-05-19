import GiftSteps from "../components/giftFinder/GiftSteps";
import GiftQuestionCard from "../components/giftFinder/GiftQuestionCard";
import GiftRecommendations from "../components/giftFinder/GiftRecommendations";

function GiftFinder() {
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
            Answer a few simple questions and our smart assistant will recommend
            meaningful gifts for you.
          </p>

   

          <GiftQuestionCard />
        </div>
      </section>

      <GiftRecommendations />
    </div>
  );
}

export default GiftFinder;