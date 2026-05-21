const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

export const chatWithGroq = async (history, userMessage) => {
  if (!API_KEY) {
    console.error("[groqService] VITE_GROQ_API_KEY is not set. Check Vercel env vars.");
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
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[groqService] API error", res.status, body);
    throw new Error("Groq API error: " + res.status);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  const searchMatch = raw.match(/SEARCH:(\{.+\})/);
  let params = null;
  let text = raw;

  if (searchMatch) {
    try { params = JSON.parse(searchMatch[1]); } catch { params = null; }
    text = raw.replace(/SEARCH:\{.+\}/, "").trim();
  }

  return { text, params };
};
