import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiRefreshCw } from "react-icons/fi";
import { chatWithGroq } from "../services/groqService";
import { giftFinder } from "../services/productService";
import { normalizeProductList } from "../utils/productUtils";
import ExploreProductCard from "../components/explore/ExploreProductCard";

const INITIAL_MESSAGE = {
  role: "ai",
  text: "Hi! I'm Giftie 🎁 I'm here to help you find the perfect gift! Who are you shopping for today?",
};

const SUGGESTIONS = [
  "My mom's birthday 🎂",
  "Valentine's Day for my girlfriend 💝",
  "Wedding gift for a friend 💍",
  "Graduation gift, budget $50 🎓",
];

function GiftFinder() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [lastParams, setLastParams] = useState(null);
  const [aiCard, setAiCard] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const fetchProducts = async (params) => {
    setProductsLoading(true);
    try {
      const res = await giftFinder({
        recipient: params.recipient || "Partner",
        occasion: params.occasion || "Birthday",
        interest: params.interest || "Jewelry",
        minBudget: params.minBudget ?? 0,
        maxBudget: params.maxBudget ?? 99999,
      });
      setProducts(normalizeProductList(res.data));
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query || aiLoading) return;
    setInput("");

    const userMsg = { role: "user", text: query };
    const history = messages.filter((m) => m.role !== "system");
    setMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const { text: aiText, params } = await chatWithGroq(history, query);
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);

      if (params) {
        setLastParams(params);
        setAiCard(aiText);
        fetchProducts(params);
      }
    } catch (err) {
      const isKeyMissing = err?.message?.includes("not set") || err?.message?.includes("API key");
      const errText = isKeyMissing
        ? "API key is not configured. Please add VITE_GROQ_API_KEY in Vercel → Settings → Environment Variables, then redeploy. 🔑"
        : "Sorry, I'm having trouble connecting. Please try again! 😊";
      console.error("[Giftie]", err?.message);
      setMessages((prev) => [...prev, { role: "ai", text: errText }]);
    } finally {
      setAiLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setProducts([]);
    setLastParams(null);
    setAiCard("");
    setInput("");
  };

  return (
    <div
      className="flex overflow-hidden bg-[#F5F2EF]"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* ── LEFT: Chat Panel ── */}
      <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col bg-white border-r border-[#EFE4DF] flex-shrink-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EFE4DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F8E7EC] flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <p className="font-black text-[#1E1B1B] text-sm">Giftie</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <p className="text-[10px] text-[#7A7272] font-bold">Powered by Groq AI</p>
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            title="New conversation"
            className="w-8 h-8 rounded-full hover:bg-[#F8F1EC] flex items-center justify-center text-[#7A7272] hover:text-[#D90452] transition"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scroll px-4 py-4 space-y-3 min-h-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 items-end msg-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-[#F8E7EC] flex items-center justify-center text-sm flex-shrink-0 mb-1">
                  🎁
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#D90452] text-white rounded-[18px] rounded-br-[4px]"
                    : "bg-[#F8F1EC] text-[#1E1B1B] rounded-[18px] rounded-bl-[4px]"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {aiLoading && (
            <div className="flex gap-2 items-end justify-start msg-in">
              <div className="w-7 h-7 rounded-full bg-[#F8E7EC] flex items-center justify-center text-sm flex-shrink-0">
                🎁
              </div>
              <div className="bg-[#F8F1EC] px-4 py-3 rounded-[18px] rounded-bl-[4px]">
                <div className="flex gap-1 items-center">
                  <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* Quick suggestions — only show at start */}
          {messages.length === 1 && !aiLoading && (
            <div className="pt-2 space-y-2">
              <p className="text-[10px] text-[#A0918B] font-bold uppercase tracking-wider text-center">
                Quick start
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-sm bg-white border border-[#EFE4DF] text-[#1E1B1B] px-4 py-2.5 rounded-[14px] hover:border-[#D90452] hover:text-[#D90452] transition font-semibold"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#EFE4DF]">
          <div className="flex items-end gap-2 bg-[#F8F1EC] rounded-[18px] px-4 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tell me about who you're shopping for..."
              className="flex-1 bg-transparent outline-none resize-none text-sm text-[#1E1B1B] placeholder:text-[#A0918B] max-h-24"
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={aiLoading || !input.trim()}
              className="w-9 h-9 bg-[#D90452] text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40 btn-press transition"
            >
              <FiSend size={14} />
            </button>
          </div>
          <p className="text-[10px] text-[#C0B0AA] text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── RIGHT: Gift Preview Panel ── */}
      <div className="flex-1 overflow-y-auto custom-scroll min-h-0">
        {/* Empty state */}
        {!lastParams && !productsLoading && (
          <div className="h-full flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 bg-[#F8E7EC] rounded-full flex items-center justify-center text-5xl anim-float mb-6">
              🎁
            </div>
            <h2 className="text-2xl font-black text-[#1E1B1B]">Gift ideas will appear here</h2>
            <p className="mt-2 text-[#7A7272] max-w-sm text-sm leading-relaxed">
              Chat with Giftie on the left and I'll curate personalized gift recommendations just for you.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs w-full">
              {["Jewelry 💍", "Home Decor 🏡", "Beauty ✨", "Personalized 🖊️"].map((tag) => (
                <div key={tag} className="bg-white rounded-[14px] border border-[#EFE4DF] px-4 py-3 text-sm font-bold text-[#7A7272] text-center">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {productsLoading && (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-[#7A7272]">Finding perfect gifts...</p>
          </div>
        )}

        {/* Products */}
        {!productsLoading && lastParams && (
          <div className="p-6">
            {/* AI message card */}
            {aiCard && (
              <div className="bg-white rounded-[20px] border border-[#F8DCE5] px-5 py-4 mb-6 flex items-start gap-3 anim-scale-in">
                <span className="text-2xl flex-shrink-0">✨</span>
                <div>
                  <p className="text-xs font-black text-[#D90452] uppercase tracking-wider mb-1">
                    Giftie's Recommendation
                  </p>
                  <p className="text-sm text-[#1E1B1B] leading-relaxed">{aiCard}</p>
                </div>
              </div>
            )}

            {/* Filter tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[lastParams.recipient, lastParams.occasion, lastParams.interest,
                lastParams.maxBudget < 99999 ? `Under $${lastParams.maxBudget}` : null
              ].filter(Boolean).map((tag) => (
                <span key={tag} className="bg-white border border-[#EFE4DF] text-[#1E1B1B] text-xs font-bold px-4 py-2 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-[20px] p-10 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-black text-[#1E1B1B]">No matching gifts found</p>
                <p className="text-sm text-[#7A7272] mt-1">Try adjusting your preferences in the chat</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-black text-[#D90452] uppercase tracking-widest mb-4">
                  {products.length} gift{products.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-stagger">
                  {products.map((product) => (
                    <div key={product.id} className="anim-fade-up">
                      <ExploreProductCard product={product} />
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  <Link
                    to={`/gift-results?recipient=${lastParams.recipient}&occasion=${lastParams.occasion}&interest=${lastParams.interest}`}
                    className="bg-[#D90452] text-white px-6 py-3 rounded-full font-black text-sm btn-press"
                  >
                    See Full Results →
                  </Link>
                  <Link
                    to="/explore"
                    className="bg-white border border-[#EFE4DF] text-[#1E1B1B] px-6 py-3 rounded-full font-black text-sm btn-press"
                  >
                    Browse All Gifts
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GiftFinder;
