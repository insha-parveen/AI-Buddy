import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, userId } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If userId not provided, try to get it from auth header
    let finalUserId = userId;
    if (!finalUserId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        if (!error && user) {
          finalUserId = user.id;
        }
      }
    }

    if (!finalUserId) {
      // Fallback for demo or if auth is disabled
      finalUserId = "anonymous";
    }

    console.log(`Generating image for user: ${finalUserId}, prompt: ${prompt}`);

    /* -------- PROMPT ENHANCEMENT -------- */
    const enhancedPrompt = `
high quality digital illustration,
cinematic lighting,
ultra detailed,
sharp focus,
4k,
artstation style,
${prompt}
    `.trim();

    /* ---------------- POLLINATIONS ---------------- */
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      enhancedPrompt
    )}?nologo=true&seed=${Date.now()}`;

    const res = await fetch(pollinationsUrl);

    if (!res.ok) {
      throw new Error(`Pollinations failed: ${res.status}`);
    }

    const imageBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    /* ---------------- UPLOAD TO SUPABASE STORAGE ---------------- */
    const fileName = `${finalUserId}/${Date.now()}-${prompt
      .slice(0, 20)
      .replace(/[^a-zA-Z0-9]/g, "_")}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, imageBuffer, {
        contentType: contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(fileName);

    const storedImageUrl = publicUrlData.publicUrl;

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: storedImageUrl,
        textContent: `Generated image for: "${prompt}"`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Generate image error:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Image generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});