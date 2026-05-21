import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiRefreshCw, FiZap } from "react-icons/fi";
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
  "Valentine's for my girlfriend 💝",
  "Wedding gift for a friend 💍",
  "Graduation gift, $50 budget 🎓",
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
        ? "API key is not configured. Please add VITE_GROQ_API_KEY in Vercel settings. 🔑"
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
    <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-[#FDF5F0] via-[#FFF8F5] to-[#FCE8EF] flex flex-col">
      <div className="flex-1 min-h-0 flex items-stretch gap-4 p-4 lg:p-5 max-w-[1400px] mx-auto w-full">

        {/* ── LEFT: Chat Panel ── */}
        <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 flex flex-col bg-white rounded-[28px] shadow-[0_8px_40px_rgba(217,4,82,0.08)] border border-[#F5E0E8] overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-[#F5E0E8] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-lg shadow-sm">
                🎁
              </div>
              <div>
                <p className="font-black text-[#1E1B1B] text-sm leading-tight">Giftie</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <p className="text-[10px] text-[#A0918B] font-semibold flex items-center gap-1">
                    <FiZap size={9} className="text-amber-400" />
                    Powered by Groq AI
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              title="New conversation"
              className="w-8 h-8 rounded-full hover:bg-[#FDF0F4] flex items-center justify-center text-[#C0A8B0] hover:text-[#D90452] transition"
            >
              <FiRefreshCw size={13} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 py-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  "flex gap-2 items-end msg-in " +
                  (msg.role === "user" ? "justify-end" : "justify-start")
                }
              >
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-xs flex-shrink-0 mb-1">
                    🎁
                  </div>
                )}
                <div
                  className={
                    "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed " +
                    (msg.role === "user"
                      ? "bg-[#D90452] text-white rounded-[18px] rounded-br-[5px] shadow-sm"
                      : "bg-[#F8F1EC] text-[#1E1B1B] rounded-[18px] rounded-bl-[5px]")
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {aiLoading && (
              <div className="flex gap-2 items-end justify-start msg-in">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF6B9E] to-[#D90452] flex items-center justify-center text-xs flex-shrink-0">
                  🎁
                </div>
                <div className="bg-[#F8F1EC] px-4 py-3 rounded-[18px] rounded-bl-[5px]">
                  <div className="flex gap-1 items-center">
                    <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-[#D90452] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestions */}
            {messages.length === 1 && !aiLoading && (
              <div className="pt-1 space-y-2">
                <p className="text-[10px] text-[#C0B0AA] font-bold uppercase tracking-widest text-center">
                  Quick start
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs bg-[#FDF8F6] border border-[#EFE4DF] text-[#5A4848] px-4 py-2.5 rounded-2xl hover:border-[#D90452] hover:bg-[#FDF0F4] hover:text-[#D90452] transition font-semibold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[#F5E0E8] flex-shrink-0">
            <div className="flex items-end gap-2 bg-[#FDF8F6] border border-[#EFE4DF] rounded-2xl px-4 py-2.5 focus-within:border-[#D90452] focus-within:shadow-[0_0_0_3px_rgba(217,4,82,0.07)] transition-all">
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
                placeholder="Tell me who you're shopping for..."
                className="flex-1 bg-transparent outline-none resize-none text-sm text-[#1E1B1B] placeholder:text-[#C0B0AA] max-h-24"
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={aiLoading || !input.trim()}
                className="w-8 h-8 bg-[#D90452] text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 btn-press transition shadow-sm"
              >
                <FiSend size={13} />
              </button>
            </div>
            <p className="text-[10px] text-[#D0C0BA] text-center mt-1.5">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* ── RIGHT: Gift Preview Panel ── */}
        <div className="flex-1 min-w-0 flex flex-col rounded-[28px] bg-white/70 border border-[#F5E0E8] shadow-[0_8px_40px_rgba(217,4,82,0.05)] overflow-hidden hidden lg:flex">

          {/* Empty state */}
          {!lastParams && !productsLoading && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B9E] to-[#D90452] rounded-[28px] flex items-center justify-center text-5xl shadow-lg anim-float">
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
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-[280px] w-full">
                {["Jewelry 💍", "Home Decor 🏡", "Beauty ✨", "Personalized 🖊️"].map((tag) => (
                  <div
                    key={tag}
                    className="bg-white rounded-2xl border border-[#EFE4DF] px-4 py-3 text-xs font-bold text-[#A0918B] text-center shadow-sm"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {productsLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
              <p className="font-black text-[#A0918B] text-sm">Finding perfect gifts...</p>
            </div>
          )}

          {/* Products */}
          {!productsLoading && lastParams && (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-6">
              {/* AI card */}
              {aiCard && (
                <div className="bg-gradient-to-r from-[#FFF0F5] to-[#FDF8F6] rounded-2xl border border-[#F5D8E4] px-5 py-4 mb-6 flex items-start gap-3 anim-scale-in">
                  <span className="text-xl flex-shrink-0">✨</span>
                  <div>
                    <p className="text-[10px] font-black text-[#D90452] uppercase tracking-wider mb-1">
                      Giftie's pick
                    </p>
                    <p className="text-sm text-[#1E1B1B] leading-relaxed">{aiCard}</p>
                  </div>
                </div>
              )}

              {/* Filter tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  lastParams.recipient,
                  lastParams.occasion,
                  lastParams.interest,
                  lastParams.maxBudget < 99999 ? "Under $" + lastParams.maxBudget : null,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="bg-white border border-[#EFE4DF] text-[#5A4848] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-[#EFE4DF]">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-black text-[#1E1B1B]">No matching gifts found</p>
                  <p className="text-sm text-[#A0918B] mt-1">Try adjusting your preferences in the chat</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black text-[#D90452] uppercase tracking-widest mb-4">
                    {products.length} gift{products.length !== 1 ? "s" : ""} found
                  </p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-stagger">
                    {products.map((product) => (
                      <div key={product.id} className="anim-fade-up">
                        <ExploreProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-3 flex-wrap">
                    <Link
                      to={
                        "/gift-results?recipient=" +
                        lastParams.recipient +
                        "&occasion=" +
                        lastParams.occasion +
                        "&interest=" +
                        lastParams.interest
                      }
                      className="bg-[#D90452] text-white px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm"
                    >
                      See Full Results →
                    </Link>
                    <Link
                      to="/explore"
                      className="bg-white border border-[#EFE4DF] text-[#1E1B1B] px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm"
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
    </div>
  );
}

export default GiftFinder;
