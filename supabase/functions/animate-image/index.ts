import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { imageUrl, animationStyle } = await req.json();
    if (!imageUrl) throw new Error("Image URL is required");

    // Image animation is not supported by built-in providers. configure an external AI gateway if needed.
    throw new Error("Image animation is not implemented without an AI gateway");

    const style = animationStyle || "subtle-motion";
    const prompts = stylePrompts[style] || stylePrompts["subtle-motion"];

    console.log(`Generating ${prompts.length} motion frames with style: ${style}`);

    // (frame generation logic removed; not available without an AI gateway)
    const framePromises = prompts.map(async (_prompt, i) => {
      throw new Error("Image animation frame generation not configured");
    });

    // won't reach here
    const frames = await Promise.all(framePromises);
    return new Response(JSON.stringify({ success: true, frames }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error in animate-image function:", error);
    const status = error?.status || 500;
    const message = error?.message || (error instanceof Error ? error.message : "An unknown error occurred");
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
