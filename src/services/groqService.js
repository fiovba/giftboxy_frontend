const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const RECIPIENTS = ["Mom", "Dad", "Partner", "Friend", "Kids", "Coworker"];
const OCCASIONS  = ["Birthday", "Wedding", "Anniversary", "Graduation", "Valentine", "Christmas", "Housewarming", "Baby Shower"];
const INTERESTS  = ["Jewelry", "Personalized", "Home Decor", "Beauty", "Accessories", "Food", "Art", "Eco-Friendly", "Vintage"];

const RECIPIENT_ALIASES = {
  girlfriend: "Partner", boyfriend: "Partner", husband: "Partner", wife: "Partner",
  spouse: "Partner", fiancée: "Partner", fiance: "Partner", fiancé: "Partner",
  gf: "Partner", bf: "Partner", "significant other": "Partner", partner: "Partner",
  mother: "Mom", mum: "Mom", mama: "Mom", mummy: "Mom", mom: "Mom",
  father: "Dad", papa: "Dad", daddy: "Dad", dad: "Dad",
  brother: "Friend", sister: "Friend", bestie: "Friend", bestfriend: "Friend", friend: "Friend",
  colleague: "Coworker", boss: "Coworker", coworker: "Coworker", manager: "Coworker",
  teacher: "Coworker",
  child: "Kids", son: "Kids", daughter: "Kids", baby: "Kids", toddler: "Kids", kid: "Kids",
  kids: "Kids",
};

const OCCASION_ALIASES = {
  "valentine's day": "Valentine", "valentines day": "Valentine", valentines: "Valentine",
  "v-day": "Valentine", vday: "Valentine", valentine: "Valentine",
  xmas: "Christmas", "christmas day": "Christmas", christmas: "Christmas",
  "baby shower": "Baby Shower", "housewarming party": "Housewarming",
  grad: "Graduation", "graduation day": "Graduation", graduation: "Graduation",
  "anniversary day": "Anniversary", "wedding day": "Wedding", marriage: "Wedding",
  wedding: "Wedding", anniversary: "Anniversary",
  bday: "Birthday", "birth day": "Birthday", birthday: "Birthday", surprise: "Birthday",
};

const INTEREST_ALIASES = {
  ring: "Jewelry", necklace: "Jewelry", bracelet: "Jewelry",
  earrings: "Jewelry", earring: "Jewelry", gold: "Jewelry", silver: "Jewelry",
  gems: "Jewelry", jewellery: "Jewelry", jewel: "Jewelry", jewelry: "Jewelry",
  perfume: "Beauty", lipstick: "Beauty", makeup: "Beauty", skincare: "Beauty",
  cosmetics: "Beauty", fragrance: "Beauty",
  candle: "Home Decor", lamp: "Home Decor", decor: "Home Decor", decoration: "Home Decor",
  painting: "Art", drawing: "Art", artwork: "Art", craft: "Art",
  chocolate: "Food", cake: "Food", sweets: "Food", snacks: "Food", coffee: "Food",
  bag: "Accessories", wallet: "Accessories", scarf: "Accessories", hat: "Accessories",
  custom: "Personalized", engraved: "Personalized", monogram: "Personalized", personalized: "Personalized",
  organic: "Eco-Friendly", eco: "Eco-Friendly", sustainable: "Eco-Friendly",
  antique: "Vintage", retro: "Vintage", classic: "Vintage",
};

function matchClosest(value, list, aliases) {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (aliases?.[v]) return aliases[v];
  const exact = list.find((i) => i.toLowerCase() === v);
  if (exact) return exact;
  const partial = list.find(
    (i) => i.toLowerCase().includes(v) || v.includes(i.toLowerCase())
  );
  return partial || null;
}

const SYSTEM_PROMPT = `You are Giftie, a warm and knowledgeable gift advisor for GiftBoxy — a curated handmade gift marketplace. You help users find the perfect gift through natural conversation.

## YOUR ROLE
You are ONLY a gift recommendation assistant. Do not answer unrelated questions. If asked something off-topic (like "who are you", "how are you"), briefly remind users you're here to help find gifts, then steer back to gift finding.

## CONVERSATION APPROACH
Guide users naturally with 1-2 focused questions at a time. Never bombard them. Build on what they share.

Step 1 — If recipient unknown: ask who the gift is for
Step 2 — If occasion unknown: ask what the occasion is
Step 3 — If budget unknown: ask about budget range
Step 4 — Suggest gift ideas, mention 2-3 options from: Jewelry, Personalized, Home Decor, Beauty, Accessories, Food, Art, Eco-Friendly, Vintage
Step 5 — Trigger SEARCH once you have enough context

## SMART DEFAULTS — trigger SEARCH early with these rules:
- User mentions a specific item (ring, necklace, candle) → search immediately, default recipient=Partner, occasion=Birthday
- User mentions only recipient → ask ONE question about occasion, then search
- User mentions recipient + occasion → search immediately, pick best interest from context
- Romantic context → interest=Jewelry or Personalized
- Creative/artistic → interest=Art
- Cook/foodie → interest=Food
- Home → interest=Home Decor

## SEARCH TRIGGER RULES
- Output SEARCH only ONCE per new gift request — do NOT repeat it for follow-up chit-chat
- Do NOT output SEARCH in response to questions about yourself, greetings, or unrelated messages
- Only output SEARCH when you have a genuine gift search to make

## VALID VALUES — use ONLY these exact strings:
recipient: Mom | Dad | Partner | Friend | Kids | Coworker
occasion: Birthday | Wedding | Anniversary | Graduation | Valentine | Christmas | Housewarming | Baby Shower
interest: Jewelry | Personalized | Home Decor | Beauty | Accessories | Food | Art | Eco-Friendly | Vintage

## SEARCH FORMAT — append at end of message, exact format, no markdown:
SEARCH:{"recipient":"Partner","occasion":"Birthday","interest":"Jewelry","minBudget":0,"maxBudget":99999}

## RESPONSE STYLE
- 2-3 sentences max
- Warm and helpful tone
- 1 emoji per response
- Mention 2-3 concrete gift ideas when making suggestions
- Budget: "under $X" or "around $X" → set maxBudget accordingly`;

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
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
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
        recipient: matchClosest(parsed.recipient, RECIPIENTS, RECIPIENT_ALIASES) || "Partner",
        occasion:  matchClosest(parsed.occasion,  OCCASIONS,  OCCASION_ALIASES)  || "Birthday",
        interest:  matchClosest(parsed.interest,  INTERESTS,  INTEREST_ALIASES)  || "Jewelry",
        minBudget: Number(parsed.minBudget ?? 0),
        maxBudget: Number(parsed.maxBudget ?? 99999),
      };
      console.log("[groqService] extracted params:", params);
    } catch (e) {
      console.warn("[groqService] JSON parse failed:", e);
    }
  }

  return { text, params };
};
