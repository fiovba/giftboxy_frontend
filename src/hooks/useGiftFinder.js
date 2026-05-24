import { useRef, useState } from "react";
import { chatWithGroq } from "../services/groqService";
import { giftFinder as apiGiftFinder, getProducts } from "../services/productService";
import { normalizeProduct, normalizeProductList } from "../utils/productUtils";

const INTEREST_KEYWORDS = {
  Jewelry:        ["jewelry", "jewel", "jewellery", "ring", "necklace", "bracelet", "earring", "pendant", "gold", "silver", "diamond", "gemstone"],
  Personalized:   ["personalized", "personalised", "custom", "engraved", "monogram", "name", "initial", "bespoke"],
  "Home Decor":   ["home", "decor", "decoration", "candle", "lamp", "vase", "cushion", "pillow", "blanket", "throw", "mug", "frame", "shelf", "plant", "diffuser", "cozy", "cosy"],
  Beauty:         ["beauty", "perfume", "skincare", "skin care", "makeup", "cosmetic", "fragrance", "serum", "lotion", "face", "lip", "body"],
  Accessories:    ["accessory", "accessories", "bag", "purse", "wallet", "scarf", "hat", "watch", "belt", "sunglasses", "gloves"],
  Food:           ["food", "chocolate", "coffee", "tea", "cake", "sweet", "candy", "snack", "gourmet", "honey", "jam", "cookie", "biscuit", "box"],
  Art:            ["art", "painting", "drawing", "print", "poster", "sculpture", "craft", "handmade", "illustration", "sketch"],
  "Eco-Friendly": ["eco", "organic", "sustainable", "natural", "green", "recycled", "biodegradable", "bamboo", "reusable", "zero waste"],
  Vintage:        ["vintage", "antique", "retro", "classic", "old", "collectible"],
};

const INITIAL_MESSAGE = {
  role: "ai",
  text: "Hey! I'm Giftie 🎁 Tell me about who you're shopping for and I'll find the perfect gift!",
};

function scoreProduct(product, keywords, interest) {
  const title = (product.title       || "").toLowerCase();
  const desc  = (product.description || "").toLowerCase();
  const cat   = (product.category    || "").toLowerCase();
  const tags  = (Array.isArray(product.tags) ? product.tags.join(" ") : "").toLowerCase();
  let score   = 0;

  for (const kw of keywords) {
    if (title.includes(kw)) score += 100;
    if (cat.includes(kw))   score += 60;
    if (desc.includes(kw))  score += 30;
    if (tags.includes(kw))  score += 20;
  }

  if (cat.includes(interest.toLowerCase())) score += 25;
  score += (product.rating || 0) * 3;
  return score;
}

async function safeApiCall(params) {
  try {
    const res = await apiGiftFinder(params);
    return normalizeProductList(res.data);
  } catch {
    return [];
  }
}

async function fetchWithFallbacks(interest, base) {
  // Level 1: exact params
  let list = await safeApiCall(base);

  // Level 2: relax budget
  if (list.length === 0 && (base.minBudget > 0 || base.maxBudget < 99999)) {
    list = await safeApiCall({ ...base, minBudget: 0, maxBudget: 99999 });
  }

  // Level 3: relax recipient + occasion
  if (list.length === 0) {
    const fallbackCombos = [
      { recipient: "Partner", occasion: "Birthday"    },
      { recipient: "Mom",     occasion: "Birthday"    },
      { recipient: "Friend",  occasion: "Birthday"    },
      { recipient: "Partner", occasion: "Valentine"   },
      { recipient: "Partner", occasion: "Anniversary" },
    ];
    for (const combo of fallbackCombos) {
      list = await safeApiCall({ ...combo, interest, minBudget: 0, maxBudget: 99999 });
      if (list.length > 0) break;
    }
  }

  // Level 4 (nuclear): all products filtered client-side by expanded keyword list
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
    } catch {
      // Nuclear fallback failed — no products available
    }
  }

  return list;
}

export function useGiftFinder() {
  const [messages,        setMessages]        = useState([INITIAL_MESSAGE]);
  const [input,           setInput]           = useState("");
  const [aiLoading,       setAiLoading]       = useState(false);
  const [products,        setProducts]        = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [lastParams,      setLastParams]      = useState(null);
  const [aiCard,          setAiCard]          = useState("");

  const lastParamsKeyRef = useRef(null);

  const fetchProducts = async (params) => {
    setProductsLoading(true);
    setRelatedProducts([]);

    try {
      const interest = params.interest         || "Jewelry";
      const keywords = params.keywords         || [];
      const strict   = params.strict           || false;
      const related  = params.relatedInterests || [];
      const base = {
        recipient: params.recipient || "Partner",
        occasion:  params.occasion  || "Birthday",
        interest,
        minBudget: params.minBudget ?? 0,
        maxBudget: params.maxBudget ?? 99999,
      };

      let primary = await fetchWithFallbacks(interest, base);
      if (keywords.length > 0) {
        primary = primary
          .map((p) => ({ ...p, _score: scoreProduct(p, keywords, interest) }))
          .sort((a, b) => b._score - a._score);
      }
      // Set primary products immediately — related fetch below must never overwrite this
      setProducts(primary);

      if (!strict && related.length > 0) {
        try {
          const seen = new Set(primary.map((p) => p.id));
          const relLists = await Promise.all(
            related.slice(0, 2).map((rel) =>
              fetchWithFallbacks(rel, { ...base, interest: rel }).catch(() => [])
            )
          );
          const relFlat = relLists
            .flat()
            .filter((p) => !seen.has(p.id))
            .map((p) => ({ ...p, _score: scoreProduct(p, keywords, interest) }))
            .sort((a, b) => b._score - a._score)
            .slice(0, 6);
          setRelatedProducts(relFlat);
        } catch {
          // Related products are non-critical — primary results are already set
        }
      }
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const query = (text || input).trim();
    if (!query || aiLoading) return;

    // Capture history before updating state to avoid stale closure
    const history = messages.filter((m) => m.role !== "system");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setAiLoading(true);

    try {
      const { text: aiText, params } = await chatWithGroq(history, query);
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);

      if (params) {
        const key = `${params.recipient}|${params.occasion}|${params.interest}|${params.maxBudget}`;
        if (key !== lastParamsKeyRef.current) {
          lastParamsKeyRef.current = key;
          setLastParams(params);
          setAiCard(aiText);
          fetchProducts(params);
        }
      }
    } catch (err) {
      const isKeyError = err?.message?.includes("not set") || err?.message?.includes("API key");
      const errText = isKeyError
        ? "API key is not configured. Please add VITE_GROQ_API_KEY in Vercel settings. 🔑"
        : "Sorry, I'm having trouble connecting. Please try again! 😊";
      setMessages((prev) => [...prev, { role: "ai", text: errText }]);
    } finally {
      setAiLoading(false);
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setProducts([]);
    setRelatedProducts([]);
    setLastParams(null);
    setAiCard("");
    setInput("");
    lastParamsKeyRef.current = null;
  };

  return {
    messages,
    input, setInput,
    aiLoading,
    products,
    relatedProducts,
    productsLoading,
    lastParams,
    aiCard,
    sendMessage,
    reset,
  };
}
