import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, extractContent } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    if (!message) throw new Error("Message is required");

    const systemPrompt = `You are an expert AI financial advisor. You provide personalized, actionable financial advice based on the user's financial data.

Your responsibilities:
1. Analyze spending patterns and identify areas for improvement
2. Suggest budgeting strategies tailored to the user's situation
3. Provide investment advice suitable for their risk profile
4. Offer tips for reducing expenses and increasing savings
5. Explain financial concepts in simple terms

Always be:
- Specific and actionable in your advice
- Encouraging but realistic
- Clear about any assumptions you make
- Focused on the user's actual financial situation

User's Financial Context:
${context}

Respond in a friendly, conversational tone while being professional. Keep responses concise but helpful (under 200 words unless detailed analysis is requested).`;

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const advice = extractContent(result.data) || "I couldn't generate advice at this time.";

    return new Response(
      JSON.stringify({ advice }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in finance-advice function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
