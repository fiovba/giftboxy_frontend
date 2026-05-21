import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiZap } from "react-icons/fi";
import { getGiftSuggestion } from "../../services/geminiService";

const SUGGESTIONS = [
  "My mom's 50th birthday, she loves cooking, budget $50",
  "Wedding gift for my best friend, something personalized",
  "Valentine's Day gift for my girlfriend, romantic, under $80",
  "Graduation gift for my brother, he loves art",
];

function AIGiftChat() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { message, params } = await getGiftSuggestion(query);

      if (params) {
        const searchParams = new URLSearchParams({
          recipient: params.recipient || "Partner",
          occasion: params.occasion || "Birthday",
          interest: params.interest || "Jewelry",
          budget: params.maxBudget < 99999
            ? `$${params.minBudget} - $${params.maxBudget}`
            : "",
          aiMessage: message,
        });
        navigate(`/gift-results?${searchParams.toString()}`);
      } else {
        setError("Couldn't understand your request. Please try rephrasing.");
      }
    } catch {
      setError("AI service unavailable. Please try the questionnaire instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Input */}
      <div className="bg-white rounded-[28px] border border-[#EFE4DF] p-4 shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Describe who you're shopping for... e.g. 'My mom's birthday, she loves jewelry, budget $60'"
          className="w-full bg-transparent outline-none resize-none text-sm text-[#1E1B1B] placeholder:text-[#A0918B] min-h-[80px]"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-[#A0918B]">Press Enter to search · Shift+Enter for new line</p>
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 bg-[#D90452] text-white px-5 py-2.5 rounded-full font-black text-sm disabled:opacity-50 btn-press"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                AI is thinking...
              </>
            ) : (
              <>
                <FiSend size={14} />
                Find Gifts
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 font-semibold text-center">{error}</p>
      )}

      {/* Quick suggestions */}
      <div className="mt-5">
        <p className="text-xs text-[#A0918B] font-bold uppercase tracking-wider text-center mb-3">
          Try these examples
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSubmit(s)}
              disabled={loading}
              className="bg-white border border-[#EFE4DF] text-[#1E1B1B] text-xs font-bold px-4 py-2.5 rounded-full hover:border-[#D90452] hover:text-[#D90452] transition btn-press disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIGiftChat;
