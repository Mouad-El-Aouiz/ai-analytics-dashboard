// Supabase Edge Function : ai-assistant (via Groq)
// Reçoit une question utilisateur + un contexte analytics structuré,
// appelle Groq (Llama) et retourne une réponse structurée.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// On utilise le même modèle que pour les insights.
// Alternative plus rapide : "openai/gpt-oss-20b"
const GROQ_MODEL = "openai/gpt-oss-120b";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssistantRequest {
  question: string;
  context: Record<string, unknown>;
}

interface AssistantResponse {
  answer: string;
  keyPoints: string[];
}

// Retry avec backoff exponentiel pour les erreurs 429 / 5xx de Groq.
async function callGroqWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // 429 = rate limit, 5xx = erreur serveur : on retente
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries - 1) {
        // Groq renvoie le délai d'attente dans le header "retry-after"
        const retryAfter = response.headers.get("retry-after");
        const delayMs = retryAfter
          ? Number(retryAfter) * 1000
          : Math.pow(2, attempt) * 500;

        console.warn(
          `Groq returned ${response.status}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Groq fetch error (attempt ${attempt + 1}):`, error);
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error("Groq call failed after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { question, context }: AssistantRequest = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing question." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(question, context);

    const groqResponse = await callGroqWithRetry(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a business analytics assistant. Always return valid JSON matching the requested schema.",
          },
          { role: "user", content: prompt },
        ],
        // Structured Outputs : Groq supporte le JSON Schema natif.
        // IMPORTANT : Groq exige que TOUTES les propriétés soient listées
        // dans le tableau "required" (plus strict qu'OpenAI).
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "assistant_response",
            schema: {
              type: "object",
              properties: {
                answer: { type: "string" },
                keyPoints: { type: "array", items: { type: "string" } },
              },
              required: ["answer", "keyPoints"],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errorText);

      if (groqResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
            code: "QUOTA_EXCEEDED",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `Groq API failed: ${groqResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const text = groqData?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Groq response missing content:", JSON.stringify(groqData));
      return new Response(
        JSON.stringify({ error: "Invalid Groq response structure." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: AssistantResponse;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Groq JSON:", text);
      return new Response(
        JSON.stringify({ error: "Groq returned invalid JSON." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-assistant unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Unexpected error.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt(question: string, context: Record<string, unknown>): string {
  return `You are a business analytics assistant. Answer the user's question using ONLY the provided data context.

Data context (JSON):
${JSON.stringify(context, null, 2)}

User question: ${question}

Instructions:
- Answer concisely (2-4 sentences).
- Reference concrete numbers from the data.
- If the data does not support a definitive answer, say "The data suggests..." or "This may be related to...".
- Never invent data.
- Return ONLY valid JSON matching this schema: { "answer": string, "keyPoints": string[] }`;
}