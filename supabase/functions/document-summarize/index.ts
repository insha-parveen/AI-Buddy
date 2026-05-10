import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, extractContent, extractToolCalls } from "../_shared/ai-client.ts";

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
    const { content, documentName, type, question, chatHistory, fileBase64, fileName, mimeType } = await req.json();

    // Handle text extraction from binary files
    if (type === "extract") {
      if (!fileBase64) throw new Error("fileBase64 is required for extraction");

      try {
        // Try to use Gemini (multimodal) for extraction
        const result = await callAI({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Extract and return ALL the text content from this document file named "${fileName}". Return only the raw text content, preserving paragraphs and structure but without any commentary or preamble.` },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${fileBase64}` } },
              ],
            },
          ],
          // Force Gemini for multimodal
          geminiModel: "gemini-2.0-flash",
        });

        if (!result.error) {
          const text = extractContent(result.data);
          if (text) {
            return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
      } catch (err) {
        console.warn("AI extraction failed/exhausted, falling back to raw text extraction", err);
      }

      // FALLBACK: If Gemini fails (e.g. 429 Quota Exhausted or unsupported format like .doc),
      // we extract printable characters from the base64 buffer.
      // This is highly effective for .doc files and somewhat for uncompressed PDFs.
      console.log("Using fallback raw text extraction for:", fileName);

      // Convert base64 to Uint8Array
      const binaryString = atob(fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(bytes);

      // Strip non-printable characters (keep newlines and tabs)
      const cleanText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();

      // If we got something usable, return it
      if (cleanText.length > 10) {
        return new Response(JSON.stringify({ text: cleanText }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // If even fallback fails to extract meaningful text
      return new Response(JSON.stringify({ error: "Could not extract text from document. AI quota may be exhausted or file format is unsupported." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!content) throw new Error("Document content is required");

    if (type === "qa") {
      const systemPrompt = `You are a helpful document Q&A assistant. Answer questions based ONLY on the provided document content. If the answer cannot be found in the document, say so clearly. Be concise and accurate.

Document: "${documentName}"

Document Content:
${content}`;

      const messages: any[] = [{ role: "system", content: systemPrompt }];
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
      messages.push({ role: "user", content: question });

      const result = await callAI({ messages });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const answer = extractContent(result.data) || "I couldn't find an answer.";
      return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else if (type === "mindmap") {
      const systemPrompt = `You are a document analysis assistant. Analyze the provided document and create a hierarchical mind map structure. Return a JSON structure with: Each node has id, label, description, children. The root node should be the main topic. Include 3-5 main branches. EVERY node MUST have a meaningful description.`;
      const userContent = `Document: "${documentName}"\n\nContent:\n${content}`;

      const tools = [
        {
          type: "function",
          function: {
            name: "create_mindmap",
            description: "Create a hierarchical mind map from the document",
            parameters: {
              type: "object",
              properties: {
                mindMap: {
                  type: "object",
                  properties: {
                    id: { type: "string" }, label: { type: "string" }, description: { type: "string" },
                    children: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, description: { type: "string" }, children: { type: "array", items: { type: "object", properties: { id: { type: "string" }, label: { type: "string" }, description: { type: "string" }, children: { type: "array", items: {} } }, required: ["id", "label", "description", "children"] } } }, required: ["id", "label", "description", "children"] } }
                  },
                  required: ["id", "label", "description", "children"]
                }
              },
              required: ["mindMap"]
            }
          }
        }
      ];

      const result = await callAI({
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
        tools,
        tool_choice: { type: "function", function: { name: "create_mindmap" } },
      });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const toolCalls = extractToolCalls(result.data);
      if (toolCalls.length > 0 && toolCalls[0].function) {
        try {
          const args = JSON.parse(toolCalls[0].function.arguments);
          return new Response(JSON.stringify({ mindMap: args.mindMap }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (parseError) {
          console.error("Failed to parse mind map:", parseError);
        }
      }

      // Fallback
      return new Response(JSON.stringify({ mindMap: { id: "root", label: documentName || "Document", children: [{ id: "1", label: "Main Topic 1", children: [] }, { id: "2", label: "Main Topic 2", children: [] }] } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else {
      // Summary
      const systemPrompt = `You are a document summarization assistant. Create a comprehensive yet concise summary. Start with a brief overview, highlight main points, include important details, keep between 150-300 words.`;
      const userContent = `Document: "${documentName}"\n\nContent:\n${content}`;

      const result = await callAI({
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
      });

      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), { status: result.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const summary = extractContent(result.data) || "Summary could not be generated.";
      return new Response(JSON.stringify({ summary }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  } catch (error) {
    console.error("Error in document-summarize function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
