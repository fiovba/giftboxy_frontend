const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are a warm, helpful gift recommendation assistant for GiftBoxy — a curated handmade gift marketplace.

When a user describes who they're shopping for, do TWO things:

1. Write a short, warm, personalized message (2-3 sentences) explaining why the gifts will be perfect.
2. Extract structured gift parameters.

Available recipients: Mom, Dad, Partner, Friend, Kids, Coworker
Available occasions: Birthday, Wedding, Anniversary, Graduation, Valentine, Christmas, Housewarming, Baby Shower
Available interests: Jewelry, Personalized, Home Decor, Beauty, Accessories, Food, Art, Eco-Friendly, Vintage

Respond in EXACTLY this format (no extra text):
MESSAGE: [your personalized warm message here]
JSON: {"recipient":"...","occasion":"...","interest":"...","minBudget":0,"maxBudget":100}

If budget is not mentioned, default to minBudget:0, maxBudget:99999.
Always pick the closest match from the available options above.`;

export const getGiftSuggestion = async (userMessage) => {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not set.");

  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT + "\n\nUser: " + userMessage },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!response.ok) throw new Error("Gemini API error: " + response.status);

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const messageMatch = text.match(/MESSAGE:\s*(.+?)(?=JSON:|$)/s);
  const jsonMatch = text.match(/JSON:\s*(\{.+\})/s);

  const message = messageMatch?.[1]?.trim() || "";
  let params = null;
  try {
    params = jsonMatch ? JSON.parse(jsonMatch[1]) : null;
  } catch {
    params = null;
  }

  return { message, params };
};
