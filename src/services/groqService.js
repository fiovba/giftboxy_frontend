const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const RECIPIENTS = ["Mom", "Dad", "Partner", "Friend", "Kids", "Coworker"];
export const OCCASIONS  = ["Birthday", "Wedding", "Anniversary", "Graduation", "Valentine", "Christmas", "Housewarming", "Baby Shower"];
export const INTERESTS  = ["Jewelry", "Personalized", "Home Decor", "Beauty", "Accessories", "Food", "Art", "Eco-Friendly", "Vintage"];

// Which interests are naturally related to each other
export const RELATED_INTERESTS = {
  Jewelry:      ["Accessories", "Personalized", "Beauty"],
  Accessories:  ["Jewelry", "Beauty", "Personalized"],
  Beauty:       ["Accessories", "Jewelry", "Personalized"],
  Personalized: ["Jewelry", "Home Decor", "Accessories"],
  "Home Decor": ["Personalized", "Art", "Eco-Friendly"],
  Food:         ["Personalized", "Home Decor"],
  Art:          ["Home Decor", "Personalized", "Vintage"],
  "Eco-Friendly": ["Home Decor", "Accessories", "Food"],
  Vintage:      ["Jewelry", "Accessories", "Art"],
};

const RECIPIENT_ALIASES = {
  girlfriend: "Partner", boyfriend: "Partner", husband: "Partner", wife: "Partner",
  spouse: "Partner", fiancée: "Partner", fiance: "Partner", fiancé: "Partner",
  gf: "Partner", bf: "Partner", partner: "Partner",
  mother: "Mom", mum: "Mom", mama: "Mom", mummy: "Mom", mom: "Mom",
  father: "Dad", papa: "Dad", daddy: "Dad", dad: "Dad",
  brother: "Friend", sister: "Friend", bestie: "Friend", friend: "Friend",
  colleague: "Coworker", boss: "Coworker", coworker: "Coworker",
  teacher: "Coworker", manager: "Coworker",
  child: "Kids", son: "Kids", daughter: "Kids", baby: "Kids", kid: "Kids", kids: "Kids",
};

const OCCASION_ALIASES = {
  "valentine's day": "Valentine", "valentines day": "Valentine", valentines: "Valentine",
  "v-day": "Valentine", valentine: "Valentine",
  xmas: "Christmas", christmas: "Christmas",
  "baby shower": "Baby Shower", "housewarming party": "Housewarming",
  grad: "Graduation", graduation: "Graduation",
  wedding: "Wedding", anniversary: "Anniversary",
  bday: "Birthday", birthday: "Birthday", surprise: "Birthday",
};

const INTEREST_ALIASES = {
  ring: "Jewelry", necklace: "Jewelry", bracelet: "Jewelry",
  earrings: "Jewelry", earring: "Jewelry", gold: "Jewelry", silver: "Jewelry",
  jewel: "Jewelry", jewellery: "Jewelry", jewelry: "Jewelry", pendant: "Jewelry",
  watch: "Accessories", bag: "Accessories", wallet: "Accessories",
  scarf: "Accessories", hat: "Accessories", sunglasses: "Accessories",
  perfume: "Beauty", lipstick: "Beauty", makeup: "Beauty", skincare: "Beauty",
  fragrance: "Beauty", cosmetics: "Beauty",
  candle: "Home Decor", lamp: "Home Decor", decor: "Home Decor", cushion: "Home Decor",
  painting: "Art", drawing: "Art", artwork: "Art", craft: "Art",
  chocolate: "Food", cake: "Food", coffee: "Food", tea: "Food", sweets: "Food",
  custom: "Personalized", engraved: "Personalized", monogram: "Personalized",
  organic: "Eco-Friendly", eco: "Eco-Friendly", sustainable: "Eco-Friendly",
  antique: "Vintage", retro: "Vintage",
};

export function matchClosest(value, list, aliases) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (aliases?.[v]) return aliases[v];
  const exact = list.find((i) => i.toLowerCase() === v);
  if (exact) return exact;
  const partial = list.find(
    (i) => i.toLowerCase().includes(v) || v.includes(i.toLowerCase())
  );
  return partial || null;
}

const SYSTEM_PROMPT = `You are Giftie, a sharp and emotionally intelligent gift advisor for GiftBoxy — a curated handmade gift marketplace.

## YOUR ONLY JOB
Help users find the perfect gift. If asked off-topic questions, give a brief friendly response and guide back to gift finding. Never go deep into off-topic territory.

## INTENT CLASSIFICATION
You must classify user intent as STRICT or OPEN:
- STRICT: user says "only", "just", "nothing else", "no accessories", "ONLY rings" → set "strict": true
- OPEN: user is browsing, says "something nice", "suggestions welcome", vague requests → set "strict": false

## CONVERSATION FLOW
- 1-2 questions max before triggering SEARCH
- If user mentions a specific item → search immediately, infer recipient/occasion from context
- If recipient + occasion known → search immediately, pick best interest
- If vague → ask ONE question about occasion OR recipient (not both at once)

## SMART INTEREST INFERENCE
- "ring", "necklace", "bracelet", "pendant" → Jewelry
- "elegant", "luxury", "romantic" → Jewelry or Personalized
- "books + coffee", "cozy" → Food + Art (use primary=Food, related=["Art","Accessories"])
- "something handmade" → Personalized or Eco-Friendly
- "for her home" → Home Decor
- "she loves art" → Art

## RESPONSE STYLE
- 2-3 sentences max. Natural, warm, never robotic.
- When suggesting: name 2-3 specific items (e.g., "a minimalist ring, a charm bracelet, or a personalized necklace")
- When strict: confirm you understood ("Got it, I'll focus only on X 💍")
- When open: mention primary + 1 related category naturally
- 1 emoji per response

## SEARCH TRIGGER — output ONCE per new request, never for chit-chat:
SEARCH:{"recipient":"Partner","occasion":"Birthday","interest":"Jewelry","minBudget":0,"maxBudget":99999,"keywords":["ring"],"strict":false,"relatedInterests":["Accessories","Personalized"]}

Rules:
- "keywords": list of SPECIFIC items user mentioned (e.g. ["ring"], ["candle","mug"])
- "strict": true if user said ONLY/JUST/NO OTHER, false otherwise
- "relatedInterests": 1-2 related categories ONLY if strict=false, empty [] if strict=true
- Do NOT output SEARCH again if params haven't changed
- No markdown, no code fences around SEARCH

## VALID VALUES:
recipient: Mom | Dad | Partner | Friend | Kids | Coworker
occasion: Birthday | Wedding | Anniversary | Graduation | Valentine | Christmas | Housewarming | Baby Shower
interest: Jewelry | Personalized | Home Decor | Beauty | Accessories | Food | Art | Eco-Friendly | Vintage`;

export const chatWithGroq = async (history, userMessage) => {
  if (!API_KEY) {
    console.error("[groqService] VITE_GROQ_API_KEY is not set.");
    throw new Error("VITE_GROQ_API_KEY is not set");
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.5,
      max_tokens: 300,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[groqService] API error", res.status, body);
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again. ⏳");
    if (res.status === 401) throw new Error("VITE_GROQ_API_KEY is not set");
    throw new Error("Groq API error: " + res.status);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  console.log("[groqService] raw:", raw);

  const searchMatch = raw.match(/SEARCH:\s*(\{[\s\S]*?\})/);
  let params = null;
  let text = raw.replace(/SEARCH:\s*\{[\s\S]*?\}/, "").replace(/```[\s\S]*?```/g, "").trim();

  if (searchMatch) {
    try {
      const parsed = JSON.parse(searchMatch[1]);
      params = {
        recipient:       matchClosest(parsed.recipient, RECIPIENTS, RECIPIENT_ALIASES) || "Partner",
        occasion:        matchClosest(parsed.occasion,  OCCASIONS,  OCCASION_ALIASES)  || "Birthday",
        interest:        matchClosest(parsed.interest,  INTERESTS,  INTEREST_ALIASES)  || "Jewelry",
        minBudget:       Number(parsed.minBudget ?? 0),
        maxBudget:       Number(parsed.maxBudget ?? 99999),
        keywords:        Array.isArray(parsed.keywords) ? parsed.keywords.map((k) => String(k).toLowerCase()) : [],
        strict:          Boolean(parsed.strict),
        relatedInterests: (Array.isArray(parsed.relatedInterests) ? parsed.relatedInterests : [])
          .map((r) => matchClosest(r, INTERESTS, INTEREST_ALIASES))
          .filter(Boolean),
      };
      // If strict, clear related interests
      if (params.strict) params.relatedInterests = [];
      console.log("[groqService] params:", params);
    } catch (e) {
      console.warn("[groqService] JSON parse failed:", e);
    }
  }

  return { text, params };
};
