import { giftFinderQuestions } from "../../data/mockData";

function GiftSteps({ currentStep }) {
  const steps = [
    ...giftFinderQuestions.map((q) => q.stepLabel),
    "Results",
  ];

  return (
    <div className="flex items-center justify-center gap-6 mt-10">
      {steps.map((step, index) => {
        const isActive = index === currentStep;

        return (
          <div key={step} className="text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-sm font-black transition ${
                isActive
                  ? "bg-[#D90452] text-white"
                  : "bg-white text-[#7A7272]"
              }`}
            >
              {index + 1}
            </div>

            <p
              className={`mt-2 text-[10px] font-black uppercase tracking-wide ${
                isActive
                  ? "text-[#D90452]"
                  : "text-[#7A7272]"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default GiftSteps;