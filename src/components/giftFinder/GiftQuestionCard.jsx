import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { giftFinderQuestions } from "../../data/mockData";
import GiftSteps from "./GiftSteps";

function GiftQuestionCard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialAnswers = useMemo(() => {
    const result = {};

    giftFinderQuestions.forEach((question) => {
      const value = searchParams.get(question.key);

      if (value) {
        result[question.key] = value.split(",");
      }
    });

    return result;
  }, [searchParams]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);

  const currentQuestion = giftFinderQuestions[step];
  const selectedAnswer = answers[currentQuestion.key] || [];

  const selectAnswer = (option) => {
    const current = answers[currentQuestion.key] || [];
    const alreadySelected = current.includes(option);

    const updated = alreadySelected
      ? current.filter((item) => item !== option)
      : [...current, option];

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: updated,
    }));
  };

  const nextStep = () => {
    if (selectedAnswer.length === 0) return;

    if (step < giftFinderQuestions.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    const params = new URLSearchParams();

    Object.entries(answers).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      }
    });

    navigate(`/gift-results?${params.toString()}`);
  };

  const prevStep = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <>
      <GiftSteps currentStep={step} />

      <div className="bg-white rounded-[32px] p-8 max-w-[520px] mx-auto mt-10 shadow-sm">
        <p className="text-[#D90452] text-xs font-black uppercase tracking-widest mb-3">
          Step {step + 1} of {giftFinderQuestions.length}
        </p>

        <h2 className="font-black text-xl">
          {currentQuestion.question}
        </h2>

        <p className="text-sm text-[#7A7272] mt-1">
          {currentQuestion.helper}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectAnswer(option)}
                className={`rounded-2xl p-5 transition text-sm font-bold ${
                  isSelected
                    ? "bg-[#D90452] text-white"
                    : "bg-[#F8F1EC] text-[#1E1B1B] hover:bg-[#F8DCE5]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 0}
            className="text-sm text-[#7A7272] font-bold disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={selectedAnswer.length === 0}
            className="bg-[#D90452] text-white px-7 py-3 rounded-full text-sm font-black disabled:opacity-40"
          >
            {step === giftFinderQuestions.length - 1
              ? "View Results"
              : "Next Question"}
          </button>
        </div>
      </div>
    </>
  );
}

export default GiftQuestionCard;