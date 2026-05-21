import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiRefreshCw, FiZap } from "react-icons/fi";
import { chatWithGroq } from "../services/groqService";
import { giftFinder, getProducts } from "../services/productService";
import { normalizeProductList, normalizeProduct } from "../utils/productUtils";
import ExploreProductCard from "../components/explore/ExploreProductCard";

// Each interest maps to keywords that products might use in title/category/description
const INTEREST_KEYWORDS = {
  "Jewelry":      ["jewelry", "jewel", "jewellery", "ring", "necklace", "bracelet", "earring", "pendant", "gold", "silver", "diamond", "gemstone"],
  "Personalized": ["personalized", "personalised", "custom", "engraved", "monogram", "name", "initial", "bespoke"],
  "Home Decor":   ["home", "decor", "decoration", "candle", "lamp", "vase", "cushion", "pillow", "blanket", "throw", "mug", "frame", "shelf", "plant", "diffuser", "cozy", "cosy"],
  "Beauty":       ["beauty", "perfume", "skincare", "skin care", "makeup", "cosmetic", "fragrance", "serum", "lotion", "face", "lip", "body"],
  "Accessories":  ["accessory", "accessories", "bag", "purse", "wallet", "scarf", "hat", "watch", "belt", "sunglasses", "gloves"],
  "Food":         ["food", "chocolate", "coffee", "tea", "cake", "sweet", "candy", "snack", "gourmet", "honey", "jam", "cookie", "biscuit", "box"],
  "Art":          ["art", "painting", "drawing", "print", "poster", "sculpture", "craft", "handmade", "illustration", "sketch"],
  "Eco-Friendly": ["eco", "organic", "sustainable", "natural", "green", "recycled", "biodegradable", "bamboo", "reusable", "zero waste"],
  "Vintage":      ["vintage", "antique", "retro", "classic", "old", "collectible"],
};

const INITIAL_MESSAGE = {
  role: "ai",
  text: "Hey! I'm Giftie 🎁 Tell me about who you're shopping for and I'll find the perfect gift!",
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [lastParams, setLastParams] = useState(null);
  const [aiCard, setAiCard] = useState("");

  const [navbarH, setNavbarH] = useState(141);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const nav = document.getElementById("main-navbar");
    if (nav) setNavbarH(nav.offsetHeight);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  // Score a product by how closely it matches user's keywords + interest
  const scoreProduct = (product, keywords, interest) => {
    const title = (product.title || "").toLowerCase();
    const desc  = (product.description || "").toLowerCase();
    const cat   = (product.category || "").toLowerCase();
    const tags  = (Array.isArray(product.tags) ? product.tags.join(" ") : "").toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (title.includes(kw))  score += 100; // exact keyword in title = top priority
      if (desc.includes(kw))   score += 30;
      if (cat.includes(kw))    score += 60;
      if (tags.includes(kw))   score += 20;
    }
    if (cat.includes(interest.toLowerCase())) score += 25;
    score += (product.rating || 0) * 3;
    return score;
  };

  const safeGiftFinder = async (params) => {
    try {
      const res = await giftFinder(params);
      return normalizeProductList(res.data);
    } catch {
      return [];
    }
  };

  const fetchAllFromApi = async (interest, base) => {
    // Level 1: full params
    let list = await safeGiftFinder(base);

    // Level 2: no budget
    if (list.length === 0 && (base.minBudget > 0 || base.maxBudget < 99999)) {
      list = await safeGiftFinder({ ...base, minBudget: 0, maxBudget: 99999 });
    }

    // Level 3: relax recipient/occasion (5 combos, same interest)
    if (list.length === 0) {
      for (const combo of [
        { recipient: "Partner", occasion: "Birthday"    },
        { recipient: "Mom",     occasion: "Birthday"    },
        { recipient: "Friend",  occasion: "Birthday"    },
        { recipient: "Partner", occasion: "Valentine"   },
        { recipient: "Partner", occasion: "Anniversary" },
      ]) {
        list = await safeGiftFinder({ ...combo, interest, minBudget: 0, maxBudget: 99999 });
        if (list.length > 0) break;
      }
    }

    // Level 4 (nuclear): load ALL products, filter client-side by expanded keyword list
    // Each level above is wrapped in safeGiftFinder so a sleeping/failing backend
    // won't prevent this level from running.
    if (list.length === 0) {
      try {
        const allRes = await getProducts();
        const allRaw =
          (Array.isArray(allRes.data)           ? allRes.data           : null) ||
          (Array.isArray(allRes.data?.data)     ? allRes.data.data      : null) ||
          (Array.isArray(allRes.data?.items)    ? allRes.data.items     : null) ||
          (Array.isArray(allRes.data?.products) ? allRes.data.products  : null) ||
          [];
        const kwList = INTEREST_KEYWORDS[interest] || [interest.toLowerCase()];
        list = allRaw
          .filter((p) => {
            const haystack = [
              p.categoryName, p.categorySlug, p.category,
              p.title, p.name, p.description,
              ...(Array.isArray(p.tags) ? p.tags : []),
            ].filter(Boolean).join(" ").toLowerCase();
            return kwList.some((kw) => haystack.includes(kw));
          })
          .map(normalizeProduct);
        console.log("[nuclear] found:", list.length, "for keywords:", kwList);
      } catch (e) {
        console.error("[nuclear] getProducts failed:", e.message);
      }
    }

    return list;
  };

  const fetchProducts = async (params) => {
    setProductsLoading(true);
    setRelatedProducts([]);
    try {
      const interest  = params.interest  || "Jewelry";
      const keywords  = params.keywords  || [];
      const strict    = params.strict    || false;
      const related   = params.relatedInterests || [];
      const base = {
        recipient: params.recipient || "Partner",
        occasion:  params.occasion  || "Birthday",
        interest,
        minBudget: params.minBudget ?? 0,
        maxBudget: params.maxBudget ?? 99999,
      };

      // Primary products — ranked by keyword relevance
      let primary = await fetchAllFromApi(interest, base);
      if (keywords.length > 0) {
        primary = primary
          .map((p) => ({ ...p, _score: scoreProduct(p, keywords, interest) }))
          .sort((a, b) => b._score - a._score);
      }
      setProducts(primary);

      // Related products — only if not strict and user is open to suggestions
      if (!strict && related.length > 0) {
        const seenIds = new Set(primary.map((p) => p.id));
        const relLists = await Promise.all(
          related.slice(0, 2).map((rel) =>
            fetchAllFromApi(rel, { ...base, interest: rel }).catch(() => [])
          )
        );
        const relFlat = relLists
          .flat()
          .filter((p) => !seenIds.has(p.id))
          .map((p) => ({ ...p, _score: scoreProduct(p, keywords, rel => rel) }))
          .sort((a, b) => b._score - a._score)
          .slice(0, 6);
        setRelatedProducts(relFlat);
      }
    } catch (e) {
      console.error("[fetchProducts] error:", e);
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
      // Only trigger a new search if params actually changed
      if (params) {
        const paramsKey = params.recipient + params.occasion + params.interest + params.maxBudget;
        const lastKey = lastParams
          ? lastParams.recipient + lastParams.occasion + lastParams.interest + lastParams.maxBudget
          : null;
        if (paramsKey !== lastKey) {
          setLastParams(params);
          setAiCard(aiText);
          fetchProducts(params);
        }
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
    setRelatedProducts([]);
    setLastParams(null);
    setAiCard("");
    setInput("");
  };

  /* ─────────────────── CHAT PANEL (shared mobile + desktop) ─────────────────── */
  const chatPanel = (
    <div className="flex flex-col bg-white rounded-[28px] shadow-[0_8px_40px_rgba(217,4,82,0.08)] border border-[#F5E0E8] overflow-hidden w-full lg:w-[420px] xl:w-[460px] lg:flex-shrink-0 lg:h-full min-h-[520px]">
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

      {/* Messages — scrollable area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3" style={{ WebkitOverflowScrolling: "touch" }}>
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
  );

  /* ─────────────────── PRODUCTS PANEL ─────────────────── */
  const productsPanel = (
    <div className="flex-1 flex flex-col rounded-[28px] bg-white/70 border border-[#F5E0E8] shadow-[0_8px_40px_rgba(217,4,82,0.05)] overflow-hidden lg:h-full">
      {!lastParams && !productsLoading && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center py-16">
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
              <div key={tag} className="bg-white rounded-2xl border border-[#EFE4DF] px-4 py-3 text-xs font-bold text-[#A0918B] text-center shadow-sm">
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}

      {productsLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D90452] border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-[#A0918B] text-sm">Finding perfect gifts...</p>
        </div>
      )}

      {!productsLoading && lastParams && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-6" style={{ WebkitOverflowScrolling: "touch" }}>
          {aiCard && (
            <div className="bg-gradient-to-r from-[#FFF0F5] to-[#FDF8F6] rounded-2xl border border-[#F5D8E4] px-5 py-4 mb-6 flex items-start gap-3 anim-scale-in">
              <span className="text-xl flex-shrink-0">✨</span>
              <div>
                <p className="text-[10px] font-black text-[#D90452] uppercase tracking-wider mb-1">Giftie's pick</p>
                <p className="text-sm text-[#1E1B1B] leading-relaxed">{aiCard}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-5">
            {[lastParams.recipient, lastParams.occasion, lastParams.interest,
              lastParams.maxBudget < 99999 ? "Under $" + lastParams.maxBudget : null]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="bg-white border border-[#EFE4DF] text-[#5A4848] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                  {tag}
                </span>
              ))}
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#EFE4DF]">
              <div className="text-4xl mb-3">🎁</div>
              <p className="font-black text-[#1E1B1B] text-lg">No exact matches found</p>
              <p className="text-sm text-[#A0918B] mt-2 max-w-xs mx-auto leading-relaxed">
                Our backend is warming up or no products match this combination.
                Browse our full collection below — you'll find plenty of great options!
              </p>
              <div className="mt-5 flex gap-3 justify-center flex-wrap">
                <Link
                  to={"/explore?category=" + (lastParams?.interest || "")}
                  className="bg-[#D90452] text-white px-5 py-2.5 rounded-full font-black text-sm btn-press"
                >
                  Browse {lastParams?.interest || "Gifts"} →
                </Link>
                <Link
                  to="/explore"
                  className="bg-[#F8F1EC] text-[#1E1B1B] px-5 py-2.5 rounded-full font-black text-sm btn-press"
                >
                  All Gifts
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-black text-[#D90452] uppercase tracking-widest mb-4">
                {products.length} gift{products.length !== 1 ? "s" : ""} found
              </p>
              {/* Primary results */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-stagger">
                {products.map((product) => (
                  <div key={product.id} className="anim-fade-up">
                    <ExploreProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Related / "You might also like" — only when not strict */}
              {relatedProducts.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">✨</span>
                    <p className="text-[10px] font-black text-[#A0918B] uppercase tracking-widest">
                      You might also like
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-stagger">
                    {relatedProducts.map((product) => (
                      <div key={product.id} className="anim-fade-up opacity-90">
                        <ExploreProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3 flex-wrap">
                <Link
                  to={"/gift-results?recipient=" + lastParams.recipient + "&occasion=" + lastParams.occasion + "&interest=" + lastParams.interest}
                  className="bg-[#D90452] text-white px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm"
                >
                  See Full Results →
                </Link>
                <Link to="/explore" className="bg-white border border-[#EFE4DF] text-[#1E1B1B] px-6 py-3 rounded-full font-black text-sm btn-press shadow-sm">
                  Browse All Gifts
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-[#FDF5F0] via-[#FFF8F5] to-[#FCE8EF]">
      {/* ── MOBILE: single column, natural scroll ── */}
      <div className="lg:hidden flex flex-col gap-4 p-4 pb-8">
        {chatPanel}
        {(lastParams || productsLoading) && (
          <div className="min-h-[400px]">{productsPanel}</div>
        )}
      </div>

      {/* ── DESKTOP: side-by-side, locked to viewport height ── */}
      <div
        className="hidden lg:flex gap-5 p-5 max-w-[1400px] mx-auto w-full"
        style={{ height: "calc(100dvh - " + navbarH + "px)" }}
      >
        {chatPanel}
        {productsPanel}
      </div>
    </div>
  );
}

export default GiftFinder;
