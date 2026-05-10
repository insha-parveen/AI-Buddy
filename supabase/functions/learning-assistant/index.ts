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
    const { action, content, topic, noteContent, question } = await req.json();

    let systemPrompt = "";
    let userMessage = "";

    switch (action) {
      case "generate_flashcards":
        systemPrompt = `You are an expert educator specializing in creating effective flashcards for learning. 
        Generate flashcards from the provided content. Each flashcard should have a clear question on the front and a concise answer on the back.
        Focus on key concepts, definitions, and important facts.
        Return ONLY a valid JSON array with objects containing "front" and "back" properties.
        Example format: [{"front": "What is X?", "back": "X is..."}]
        Generate 5-10 flashcards depending on content length.`;
        userMessage = `Generate flashcards from this content about "${topic}":\n\n${content}`;
        break;
      case "summarize_note":
        systemPrompt = `You are an expert at summarizing educational content. Create a clear, concise summary that captures the main points, key concepts, and important details. Use bullet points for better readability. Include any formulas, definitions, or critical facts.`;
        userMessage = `Summarize this note:\n\n${noteContent}`;
        break;
      case "generate_note":
        systemPrompt = `You are an expert educator and note-taker. Generate comprehensive, well-structured study notes on the given topic. Include: Clear headings and subheadings, Key concepts and definitions, Examples where helpful, Important points to remember. Format using markdown for readability.`;
        userMessage = `Generate detailed study notes on: ${topic}`;
        break;
      case "explain_concept":
        systemPrompt = `You are a patient, knowledgeable tutor who excels at explaining complex concepts simply. Break down the concept into understandable parts. Use analogies and examples when helpful.`;
        userMessage = question;
        break;
      case "quiz_question":
        systemPrompt = `You are an educational quiz master. Based on the provided content, generate a challenging but fair quiz question. Include 4 multiple choice options (A, B, C, D). Return as JSON: {"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A", "explanation": "..."}`;
        userMessage = `Generate a quiz question from this content:\n\n${content}`;
        break;
      case "chat":
        systemPrompt = `You are a friendly and knowledgeable learning assistant. Help the user with their studies, answer questions, explain concepts, and provide learning guidance. Be encouraging and supportive.`;
        userMessage = question;
        break;
      case "generate_mindmap":
        systemPrompt = `You are an expert educator who creates structured mind maps. Generate a hierarchical mind map as a JSON object with this structure:
        {"id": "root", "label": "Main Topic", "description": "Brief description", "children": [{"id": "1", "label": "Sub-topic", "description": "Brief description", "children": [...]}]}
        Rules: EVERY node MUST have id, label, description, children. Include 3-5 main branches with 2-4 sub-branches each. Return ONLY valid JSON.`;
        userMessage = `Create a comprehensive mind map for learning about: ${topic}${content ? `\n\nAdditional context:\n${content}` : ""}`;
        break;
      default:
        throw new Error("Invalid action");
    }

    console.log(`Processing ${action} request`);

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resultText = extractContent(result.data) || "";
    console.log(`Successfully processed ${action} request via ${result.provider}`);

    // Parse JSON responses for specific actions
    if (action === "generate_flashcards" || action === "quiz_question") {
      try {
        const jsonMatch = resultText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ result: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
      }
    }

    if (action === "generate_mindmap") {
      try {
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ result: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch (parseError) {
        console.error("Mind map JSON parse error:", parseError);
      }
    }

    return new Response(JSON.stringify({ result: resultText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Learning assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
