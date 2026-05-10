// Shared AI client: Groq primary, Gemini free fallback
// Groq API: https://api.groq.com/openai/v1/chat/completions
// Gemini free: https://generativelanguage.googleapis.com/v1beta/openai/chat/completions

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Default models
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_MODEL = "gemini-2.0-flash";

interface AIMessage {
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface AIRequestOptions {
  messages: AIMessage[];
  model?: string;
  stream?: boolean;
  tools?: any[];
  tool_choice?: any;
  modalities?: string[];
  groqModel?: string;
  geminiModel?: string;
}

interface AIResponse {
  provider: "groq" | "gemini";
  data?: any;
  body?: ReadableStream<Uint8Array> | null;
  error?: string;
  status?: number;
}

export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  const groqModel = options.groqModel || GROQ_MODEL;
  const geminiModel = options.geminiModel || GEMINI_MODEL;

  // Try Groq first
  if (GROQ_API_KEY) {
    try {
      console.log(`[AI] Trying Groq (${groqModel})...`);
      const body: any = {
        model: groqModel,
        messages: options.messages,
      };
      if (options.stream) body.stream = true;
      if (options.tools) {
        body.tools = options.tools;
        body.tool_choice = options.tool_choice;
      }

      const resp = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        console.log("[AI] Groq succeeded");
        if (options.stream) {
          return { provider: "groq", body: resp.body };
        }
        const data = await resp.json();
        return { provider: "groq", data };
      }

      const errText = await resp.text();
      console.warn(`[AI] Groq failed (${resp.status}): ${errText}`);

      // If rate limited, fall through to Gemini
      if (resp.status === 429 || resp.status === 503) {
        console.log("[AI] Falling back to Gemini...");
      } else {
        // For other errors, still try Gemini as fallback
        console.log("[AI] Groq error, trying Gemini fallback...");
      }
    } catch (err) {
      console.warn("[AI] Groq request failed:", err);
    }
  }

  // Fallback to Gemini free API
  if (GEMINI_API_KEY) {
    try {
      console.log(`[AI] Trying Gemini free (${geminiModel})...`);
      const body: any = {
        model: geminiModel,
        messages: options.messages,
      };
      if (options.stream) body.stream = true;
      if (options.tools) {
        body.tools = options.tools;
        body.tool_choice = options.tool_choice;
      }

      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (resp.ok) {
        console.log("[AI] Gemini succeeded");
        if (options.stream) {
          return { provider: "gemini", body: resp.body };
        }
        const data = await resp.json();
        return { provider: "gemini", data };
      }

      const errText = await resp.text();
      console.error(`[AI] Gemini also failed (${resp.status}): ${errText}`);
      return { provider: "gemini", error: `AI unavailable: ${resp.status}`, status: resp.status };
    } catch (err) {
      console.error("[AI] Gemini request failed:", err);
      return { provider: "gemini", error: "AI request failed" };
    }
  }


  return { provider: "groq", error: "No AI API keys configured (set GROQ_API_KEY or GEMINI_API_KEY)" };
}

// Helper to extract text content from AI response
export function extractContent(data: any): string {
  return data?.choices?.[0]?.message?.content || "";
}

// Helper to extract tool calls from AI response
export function extractToolCalls(data: any): any[] {
  return data?.choices?.[0]?.message?.tool_calls || [];
}
