const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const RECIPIENTS = ["Mom", "Dad", "Partner", "Friend", "Kids", "Coworker"];
const OCCASIONS  = ["Birthday", "Wedding", "Anniversary", "Graduation", "Valentine", "Christmas", "Housewarming", "Baby Shower"];
const INTERESTS  = ["Jewelry", "Personalized", "Home Decor", "Beauty", "Accessories", "Food", "Art", "Eco-Friendly", "Vintage"];

// Map user-friendly words to canonical values
const RECIPIENT_ALIASES = {
  girlfriend: "Partner", boyfriend: "Partner", husband: "Partner", wife: "Partner",
  spouse: "Partner", fiancé: "Partner", fiance: "Partner", lover: "Partner",
  mother: "Mom", mum: "Mom", mama: "Mom", anne: "Mom",
  father: "Dad", papa: "Dad", baba: "Dad",
  brother: "Friend", sister: "Friend", colleague: "Coworker", boss: "Coworker",
  child: "Kids", son: "Kids", daughter: "Kids", baby: "Kids",
};
const OCCASION_ALIASES = {
  "valentines day": "Valentine", "valentine's day": "Valentine", "valentines": "Valentine",
  "christmas day": "Christmas", "xmas": "Christmas",
  "baby shower": "Baby Shower", "housewarming party": "Housewarming",
  "graduation day": "Graduation", "grad": "Graduation",
  "anniversary day": "Anniversary", "wedding day": "Wedding",
};

function matchClosest(value, list, aliases) {
  if (!value) return null;
  const v = value.trim().toLowerCase();

  // alias lookup first
  if (aliases?.[v]) return aliases[v];

  // exact case-insensitive
  const exact = list.find((i) => i.toLowerCase() === v);
  if (exact) return exact;

  // list item contains value or value contains list item
  const partial = list.find(
    (i) => i.toLowerCase().includes(v) || v.includes(i.toLowerCase())
  );
  return partial || list[0]; // fallback to first valid option
}

const SYSTEM_PROMPT = `You are Giftie, a gift assistant for GiftBoxy — a handmade gift marketplace.

Your job: ask friendly questions to gather recipient, occasion, and optionally interest and budget. Keep replies SHORT (2-3 sentences max) and warm. Use 1 emoji.

STRICT RULES:
1. Once you know recipient + occasion, output a SEARCH block.
2. Use ONLY these exact values — do not invent others:
   recipient: Mom | Dad | Partner | Friend | Kids | Coworker
   occasion: Birthday | Wedding | Anniversary | Graduation | Valentine | Christmas | Housewarming | Baby Shower
   interest: Jewelry | Personalized | Home Decor | Beauty | Accessories | Food | Art | Eco-Friendly | Vintage
3. End your message with this EXACT format on its own line (no extra spaces):
SEARCH:{"recipient":"Mom","occasion":"Birthday","interest":"Jewelry","minBudget":0,"maxBudget":99999}
4. Do NOT wrap SEARCH in markdown, code blocks, or quotes.
5. Pick the closest matching interest if not specified (default: Jewelry).
6. For budget: if user says "under $50" use maxBudget:50. If no budget, use maxBudget:99999.`;

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
      temperature: 0.3,
      max_tokens: 350,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[groqService] API error", res.status, body);
    throw new Error("Groq API error: " + res.status);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  console.log("[groqService] raw response:", raw);

  // Match SEARCH block — handle optional whitespace, newlines, code fences
  const searchMatch = raw.match(/SEARCH:\s*(\{[\s\S]*?\})/);
  let params = null;
  let text = raw.replace(/SEARCH:\s*\{[\s\S]*?\}/, "").replace(/```[\s\S]*?```/g, "").trim();

  if (searchMatch) {
    try {
      const parsed = JSON.parse(searchMatch[1]);
      // Normalize all values to match exactly what the backend expects
      params = {
        recipient: matchClosest(parsed.recipient, RECIPIENTS, RECIPIENT_ALIASES),
        occasion:  matchClosest(parsed.occasion,  OCCASIONS,  OCCASION_ALIASES),
        interest:  matchClosest(parsed.interest,  INTERESTS,  null),
        minBudget: Number(parsed.minBudget ?? 0),
        maxBudget: Number(parsed.maxBudget ?? 99999),
      };
      console.log("[groqService] extracted params:", params);
    } catch (e) {
      console.warn("[groqService] failed to parse SEARCH JSON:", searchMatch[1], e);
      params = null;
    }
  }

  return { text, params };
};
