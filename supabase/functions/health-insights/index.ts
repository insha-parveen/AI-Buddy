import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/ai-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface HealthData {
  habits: { name: string; streak: number; completedToday: boolean }[];
  dailyLog: { sleep: number; water: number; exercise: number; mood: number };
  weeklyData: { date: string; sleep: number; water: number; exercise: number; mood: number }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { healthData } = await req.json() as { healthData: HealthData };

    const systemPrompt = `You are a friendly and encouraging AI health coach. Analyze the user's health data and provide personalized insights, tips, and encouragement.

Your response should be structured with these sections:
1. **Overall Health Score** (0-100) with a brief explanation
2. **Key Insights** (2-3 bullet points about patterns you notice)
3. **Recommendations** (2-3 actionable tips based on their data)
4. **Motivation** (A short encouraging message)

Be positive but honest. If data shows concerning patterns, address them gently with constructive suggestions.
Use emojis sparingly but appropriately to make the response engaging.
Keep your response concise and actionable.`;

    const userMessage = `Here is my health data for analysis:

**Habits:**
${healthData.habits.length > 0
        ? healthData.habits.map(h => `- ${h.name}: ${h.streak} day streak, ${h.completedToday ? "completed today ✓" : "not completed today"}`).join("\n")
        : "No habits tracked yet"}

**Today's Log:**
- Sleep: ${healthData.dailyLog.sleep} hours
- Water: ${healthData.dailyLog.water} glasses
- Exercise: ${healthData.dailyLog.exercise} minutes
- Mood: ${healthData.dailyLog.mood}/5

**Weekly Trends:**
${healthData.weeklyData.length > 0
        ? healthData.weeklyData.map(d => `- ${d.date}: Sleep ${d.sleep}h, Water ${d.water}, Exercise ${d.exercise}min, Mood ${d.mood}/5`).join("\n")
        : "No weekly data available yet"}

Please provide personalized health insights based on this data.`;

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
    });

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(result.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Health insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
