const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are a warm, enthusiastic gift recommendation assistant for GiftBoxy — a curated handmade gift marketplace. Your name is "Giftie".

Help users find the perfect gift through friendly conversation. Ask follow-up questions if needed.

When you have enough info (recipient, occasion, optional: interest & budget), include a JSON block in your response.

Available recipients: Mom, Dad, Partner, Friend, Kids, Coworker
Available occasions: Birthday, Wedding, Anniversary, Graduation, Valentine, Christmas, Housewarming, Baby Shower
Available interests: Jewelry, Personalized, Home Decor, Beauty, Accessories, Food, Art, Eco-Friendly, Vintage

If you have enough info to search, end your response with:
SEARCH:{"recipient":"...","occasion":"...","interest":"...","minBudget":0,"maxBudget":99999}

Keep responses short, warm, and conversational (2-4 sentences max). Use 1-2 emojis.
Do NOT include the SEARCH block if you still need more info from the user.`;

export const chatWithGemini = async (history, userMessage) => {
  if (!API_KEY) {
    console.error("[geminiService] VITE_GEMINI_API_KEY is not set. Check Vercel env vars.");
    throw new Error("VITE_GEMINI_API_KEY is not set");
  }

  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    { role: "model", parts: [{ text: "Hi! I'm Giftie 🎁 I'm here to help you find the perfect gift! Who are you shopping for today?" }] },
    ...history.map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[geminiService] API error", res.status, body);
    throw new Error("Gemini API error: " + res.status);
  }
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const searchMatch = raw.match(/SEARCH:(\{.+\})/);
  let params = null;
  let text = raw;

  if (searchMatch) {
    try { params = JSON.parse(searchMatch[1]); } catch { params = null; }
    text = raw.replace(/SEARCH:\{.+\}/, "").trim();
  }

  return { text, params };
};
