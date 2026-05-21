const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const RECIPIENTS = ["Mom", "Dad", "Partner", "Friend", "Kids", "Coworker"];
const OCCASIONS  = ["Birthday", "Wedding", "Anniversary", "Graduation", "Valentine", "Christmas", "Housewarming", "Baby Shower"];
const INTERESTS  = ["Jewelry", "Personalized", "Home Decor", "Beauty", "Accessories", "Food", "Art", "Eco-Friendly", "Vintage"];

const RECIPIENT_ALIASES = {
  girlfriend: "Partner", boyfriend: "Partner", husband: "Partner", wife: "Partner",
  spouse: "Partner", fiancée: "Partner", fiance: "Partner", fiancé: "Partner",
  gf: "Partner", bf: "Partner", "significant other": "Partner",
  mother: "Mom", mum: "Mom", mama: "Mom", mummy: "Mom",
  father: "Dad", papa: "Dad", daddy: "Dad",
  brother: "Friend", sister: "Friend", bestie: "Friend", bestfriend: "Friend",
  colleague: "Coworker", boss: "Coworker", coworker: "Coworker", manager: "Coworker",
  child: "Kids", son: "Kids", daughter: "Kids", baby: "Kids", toddler: "Kids", kid: "Kids",
};

const OCCASION_ALIASES = {
  "valentine's day": "Valentine", "valentines day": "Valentine", valentines: "Valentine",
  "v-day": "Valentine", vday: "Valentine",
  xmas: "Christmas", "christmas day": "Christmas",
  "baby shower": "Baby Shower", "housewarming party": "Housewarming",
  grad: "Graduation", "graduation day": "Graduation",
  "anniversary day": "Anniversary", "wedding day": "Wedding", marriage: "Wedding",
  bday: "Birthday", "birth day": "Birthday", "born day": "Birthday",
};

const INTEREST_ALIASES = {
  necklace: "Jewelry", ring: "Jewelry", bracelet: "Jewelry",
  earrings: "Jewelry", earring: "Jewelry", gold: "Jewelry", silver: "Jewelry",
  gems: "Jewelry", jewellery: "Jewelry", jewel: "Jewelry",
  perfume: "Beauty", lipstick: "Beauty", makeup: "Beauty", skincare: "Beauty",
  cosmetics: "Beauty", fragrance: "Beauty",
  candle: "Home Decor", lamp: "Home Decor", decor: "Home Decor", decoration: "Home Decor",
  painting: "Art", drawing: "Art", artwork: "Art", craft: "Art",
  chocolate: "Food", cake: "Food", sweets: "Food", snacks: "Food", coffee: "Food",
  bag: "Accessories", wallet: "Accessories", scarf: "Accessories", hat: "Accessories",
  custom: "Personalized", engraved: "Personalized", monogram: "Personalized",
  organic: "Eco-Friendly", eco: "Eco-Friendly", sustainable: "Eco-Friendly", green: "Eco-Friendly",
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

const SYSTEM_PROMPT = `You are Giftie, an expert gift advisor for GiftBoxy — a curated handmade gift marketplace. You are warm, sharp, and efficient.

PERSONALITY: Think like a knowledgeable friend who "gets it" immediately. Make smart inferences. Don't ask for info you can figure out.

SEARCH RULES:
- Trigger SEARCH as soon as you can reasonably infer recipient + occasion. Max 1 follow-up question.
- If user mentions only a category (e.g. "jewelry", "something for my mom"), trigger SEARCH immediately with smart defaults.
- Infer interest from context: romantic → Jewelry/Personalized, cook → Food, creative → Art, etc.
- Budget: parse "under $X", "around $X", "budget $X" → set maxBudget accordingly.

VALID VALUES ONLY:
recipient: Mom | Dad | Partner | Friend | Kids | Coworker
occasion: Birthday | Wedding | Anniversary | Graduation | Valentine | Christmas | Housewarming | Baby Shower
interest: Jewelry | Personalized | Home Decor | Beauty | Accessories | Food | Art | Eco-Friendly | Vintage

OUTPUT FORMAT — append this on its own line at the end when ready:
SEARCH:{"recipient":"Partner","occasion":"Birthday","interest":"Jewelry","minBudget":0,"maxBudget":99999}

CRITICAL: No markdown, no code blocks, no quotes around SEARCH. Exact format above only.

RESPONSE STYLE: 2-3 sentences max. Warm and confident. 1 emoji. Show you understood their request.`;

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
      console.log("[groqService] params:", params);
    } catch (e) {
      console.warn("[groqService] parse error:", e);
    }
  }

  return { text, params };
};
