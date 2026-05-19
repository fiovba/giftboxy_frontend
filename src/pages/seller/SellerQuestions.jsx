import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyQuestions, answerQuestion, updateQuestionAnswer } from "../../services/questionService";

function SellerQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [answerTexts, setAnswerTexts] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const loadQuestions = (unanswered = false) => {
    setLoading(true);
    getMyQuestions(unanswered)
      .then((res) => {
        const d = res.data;
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.data) ? d.data
          : Array.isArray(d?.items) ? d.items : [];
        setQuestions(list);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestions(filter === "unanswered");
  }, [filter]);

  const handleAnswer = async (questionId, isUpdate = false) => {
    const text = answerTexts[questionId]?.trim();
    if (!text) { toast.error("Answer cannot be empty."); return; }

    setSubmitting(questionId);
    try {
      if (isUpdate) {
        await updateQuestionAnswer(questionId, { answerText: text });
      } else {
        await answerQuestion(questionId, { answerText: text });
      }
      toast.success("Answer submitted!");
      setAnswerTexts((prev) => ({ ...prev, [questionId]: "" }));
      loadQuestions(filter === "unanswered");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not submit answer.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="pb-24 lg:pb-0">
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">Q&A</p>
      <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black">Customer Questions</h1>
      <p className="mt-1 text-[#7A7272] text-sm">Answer questions from your customers.</p>

      {/* Filter */}
      <div className="flex gap-2 sm:gap-3 mt-5 sm:mt-6 flex-wrap">
        {["all", "unanswered"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-black text-xs sm:text-sm capitalize transition ${
              filter === f
                ? "bg-[#D90452] text-white"
                : "bg-white text-[#1E1B1B] border border-[#EFE4DF]"
            }`}
          >
            {f === "all" ? "All Questions" : "Unanswered"}
          </button>
        ))}
      </div>

      <div className="mt-5 sm:mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-[26px] p-8 sm:p-10 text-center border border-[#EFE4DF]">
            <div className="text-4xl sm:text-5xl mb-4">💬</div>
            <h2 className="text-xl sm:text-2xl font-black">No questions yet</h2>
            <p className="text-[#7A7272] mt-2 text-sm">Customer questions will appear here.</p>
          </div>
        ) : (
          questions.map((item) => {
            const hasAnswer = !!(item.answerText || item.answer);
            const isSubmitting = submitting === item.id;

            return (
              <div key={item.id} className="bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 lg:p-6 border border-[#EFE4DF]">
                {/* Product info */}
                {(item.productTitle || item.product?.title) && (
                  <p className="text-xs text-[#D90452] font-black uppercase tracking-wider mb-3 truncate">
                    📦 {item.productTitle || item.product?.title}
                  </p>
                )}

                {/* Question + badge */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D90452] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                    Q
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm leading-snug break-words">
                      {item.questionText || item.question || item.text}
                    </p>
                    <p className="text-xs text-[#7A7272] mt-1">
                      — {item.userName || item.buyerName || item.user?.name || "Buyer"} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full flex-shrink-0 ${
                    hasAnswer
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {hasAnswer ? "Answered" : "Pending"}
                  </span>
                </div>

                {/* Existing Answer */}
                {hasAnswer && (
                  <div className="mt-3 ml-9 sm:ml-11 flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E1B1B] text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                      A
                    </div>
                    <p className="text-sm text-[#1E1B1B] leading-snug break-words flex-1">
                      {item.answerText || item.answer}
                    </p>
                  </div>
                )}

                {/* Answer Form */}
                <div className="mt-4 ml-9 sm:ml-11 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <input
                    value={answerTexts[item.id] || ""}
                    onChange={(e) =>
                      setAnswerTexts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder={hasAnswer ? "Update your answer..." : "Write your answer..."}
                    className="flex-1 bg-[#F8F1EC] rounded-full px-5 py-3 outline-none text-sm"
                  />
                  <button
                    onClick={() => handleAnswer(item.id, hasAnswer)}
                    disabled={isSubmitting}
                    className="bg-[#D90452] text-white px-5 py-3 rounded-full font-black text-sm disabled:opacity-60 whitespace-nowrap sm:flex-shrink-0"
                  >
                    {isSubmitting ? "..." : hasAnswer ? "Update" : "Answer"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default SellerQuestions;