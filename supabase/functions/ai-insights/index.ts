// Supabase Edge Function : ai-insights (via Groq)
// Reçoit un contexte analytics structuré et appelle Groq (Llama) pour générer
// des insights business. La clé GROQ_API_KEY reste côté serveur.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

// Modèle Llama 3.3 70B : excellent compromis qualité/coût.
// Alternative plus rapide : "llama-3.1-8b-instant" (14 400 req/jour).
const GROQ_MODEL = "openai/gpt-oss-120b";

// Endpoint compatible OpenAI.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AiInsightsRequest {
  period: string;
  revenue: { value: number; changePercent: number | null };
  orders: { value: number; changePercent: number | null };
  newCustomers: number;
  totalCustomers: number;
  newUsers: number;
  totalUsers: number;
  averageOrderValue: number;
  topProducts: { product: string; revenue: number }[];
  revenueByCategory: { category: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

interface AiInsightsResponse {
  executiveSummary: string;
  positiveTrends: string[];
  negativeTrends: string[];
  anomalies: string[];
  recommendations: string[];
}

// Retry avec backoff exponentiel pour les erreurs 5xx de Groq.
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
        // On essaie de lire le retry-after si présent
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

    const context: AiInsightsRequest = await req.json();
    const prompt = buildPrompt(context);

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
              "You are a senior business analyst. Always return valid JSON matching the requested schema.",
          },
          { role: "user", content: prompt },
        ],
        // Structured Outputs : Groq supporte le JSON Schema natif.
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ai_insights",
            schema: {
              type: "object",
              properties: {
                executiveSummary: { type: "string" },
                positiveTrends: { type: "array", items: { type: "string" } },
                negativeTrends: { type: "array", items: { type: "string" } },
                anomalies: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
              },
              required: [
                "executiveSummary",
                "positiveTrends",
                "negativeTrends",
                "anomalies",
                "recommendations",
              ],
              additionalProperties: false,
            },
          },
        },
        temperature: 0.4,
        max_tokens: 2048,
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

    let insights: AiInsightsResponse;
    try {
      insights = JSON.parse(text);
    } catch {
      console.error("Failed to parse Groq JSON:", text);
      return new Response(
        JSON.stringify({ error: "Groq returned invalid JSON." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(insights), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-insights unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "Unexpected error.",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildPrompt(ctx: AiInsightsRequest): string {
  return `Analyze the following analytics data and produce a structured JSON insight report.

Period: ${ctx.period}

Key metrics:
- Revenue: $${ctx.revenue.value} (change: ${ctx.revenue.changePercent ?? "N/A"}%)
- Completed Orders: ${ctx.orders.value} (change: ${ctx.orders.changePercent ?? "N/A"}%)
- New Customers: ${ctx.newCustomers}
- Total Customers: ${ctx.totalCustomers}
- New Users: ${ctx.newUsers}
- Total Users: ${ctx.totalUsers}
- Average Order Value: $${ctx.averageOrderValue.toFixed(2)}

Top products by revenue:
${ctx.topProducts.map((p) => `- ${p.product}: $${p.revenue}`).join("\n")}

Revenue by category:
${ctx.revenueByCategory.map((c) => `- ${c.category}: $${c.revenue}`).join("\n")}

Orders by status:
${ctx.ordersByStatus.map((o) => `- ${o.status}: ${o.count}`).join("\n")}

Monthly revenue:
${ctx.monthlyRevenue.map((m) => `- ${m.month}: $${m.revenue}`).join("\n")}

Instructions:
1. Write a 2-3 sentence executive summary of the period.
2. List positive trends (things that grew). Only facts supported by the data.
3. List negative trends (things that declined). Only facts supported by the data.
4. List anomalies (unusual deviations). Only if actually present.
5. List 3-5 actionable business recommendations based on observed data.
6. Never invent data. If something is uncertain, phrase it as "may be related to".
7. Return ONLY valid JSON matching the schema.`;
}