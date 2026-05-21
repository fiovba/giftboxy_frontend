const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const RECIPIENTS = ["Mom", "Dad", "Partner", "Friend", "Kids", "Coworker"];
const OCCASIONS  = ["Birthday", "Wedding", "Anniversary", "Graduation", "Valentine", "Christmas", "Housewarming", "Baby Shower"];
const INTERESTS  = ["Jewelry", "Personalized", "Home Decor", "Beauty", "Accessories", "Food", "Art", "Eco-Friendly", "Vintage"];

const RECIPIENT_ALIASES = {
  girlfriend: "Partner", boyfriend: "Partner", husband: "Partner", wife: "Partner",
  spouse: "Partner", fiancé: "Partner", fiance: "Partner", lover: "Partner",
  sevgilim: "Partner", sevgilisi: "Partner", ər: "Partner", arvad: "Partner",
  nişanlım: "Partner", nişanlı: "Partner",
  mother: "Mom", mum: "Mom", mama: "Mom", anne: "Mom",
  anam: "Mom", ana: "Mom", nənəm: "Mom", nənə: "Mom",
  father: "Dad", papa: "Dad", baba: "Dad", atam: "Dad", ata: "Dad",
  brother: "Friend", sister: "Friend", qardaş: "Friend", bacı: "Friend",
  dost: "Friend", yoldaş: "Friend", rəfiqəm: "Friend", rəfiqim: "Friend",
  colleague: "Coworker", boss: "Coworker", iş: "Coworker", həmkar: "Coworker",
  child: "Kids", son: "Kids", daughter: "Kids", baby: "Kids",
  uşaq: "Kids", oğlum: "Kids", qızım: "Kids",
};

const OCCASION_ALIASES = {
  "valentines day": "Valentine", "valentine's day": "Valentine", valentines: "Valentine",
  sevgililər: "Valentine", sevgililer: "Valentine",
  "christmas day": "Christmas", xmas: "Christmas", milad: "Christmas",
  "baby shower": "Baby Shower", "housewarming party": "Housewarming",
  "graduation day": "Graduation", grad: "Graduation", məzuniyyət: "Graduation",
  "anniversary day": "Anniversary", "wedding day": "Wedding",
  toy: "Wedding", nikah: "Wedding", ad: "Birthday", doğum: "Birthday",
  doğumgünü: "Birthday", "ad günü": "Birthday", "ad gunu": "Birthday",
  yubileyi: "Anniversary", ildönümü: "Anniversary",
};

const INTEREST_ALIASES = {
  necklace: "Jewelry", ring: "Jewelry", bracelet: "Jewelry", earring: "Jewelry",
  earrings: "Jewelry", gold: "Jewelry", silver: "Jewelry", zərgərlik: "Jewelry",
  zinət: "Jewelry", boyunbağı: "Jewelry", üzük: "Jewelry", qolbaq: "Jewelry",
  perfume: "Beauty", lipstick: "Beauty", makeup: "Beauty", skincare: "Beauty",
  ətir: "Beauty", gözəllik: "Beauty", kosmetika: "Beauty",
  candle: "Home Decor", lamp: "Home Decor", decor: "Home Decor",
  ev: "Home Decor", dekor: "Home Decor", şam: "Home Decor",
  painting: "Art", drawing: "Art", rəsm: "Art", sənət: "Art",
  chocolate: "Food", cake: "Food", şokolad: "Food", tort: "Food", yemək: "Food",
  bag: "Accessories", wallet: "Accessories", çanta: "Accessories", cüzdan: "Accessories",
  custom: "Personalized", fərdi: "Personalized", adlı: "Personalized",
  organic: "Eco-Friendly", eco: "Eco-Friendly", təbii: "Eco-Friendly",
  antique: "Vintage", vintage: "Vintage", köhnə: "Vintage",
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

const SYSTEM_PROMPT = `Sən GiftBoxy — əl işi hədiyyə mağazasının köməkçisi "Gifti"sən.
İstifadəçi ilə AZƏRBAYCAN DİLİNDƏ danış. Qısa, mehriban cavab ver (2-3 cümlə). 1 emoji işlət.

QAYDALAR:
1. Recipient + Occasion bildikdə SEARCH bloku çıxar.
2. Əgər istifadəçi yalnız kateqoriya/maraq (məs. "zərgərlik", "jewelry") yazarsa — recipient="Partner", occasion="Birthday" default götür və DƏRHAL SEARCH çıxar.
3. YALNIZ bu dəyərləri istifadə et:
   recipient: Mom | Dad | Partner | Friend | Kids | Coworker
   occasion: Birthday | Wedding | Anniversary | Graduation | Valentine | Christmas | Housewarming | Baby Shower
   interest: Jewelry | Personalized | Home Decor | Beauty | Accessories | Food | Art | Eco-Friendly | Vintage
4. SEARCH bloku DƏQIQ belə olsun (başqa heç nə əlavə etmə):
SEARCH:{"recipient":"Partner","occasion":"Birthday","interest":"Jewelry","minBudget":0,"maxBudget":99999}
5. SEARCH-i markdown, kod bloku, dırnaq içinə alma.
6. Budget: "50 dollar altı" → maxBudget:50. Yoxdursa → maxBudget:99999.`;

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
