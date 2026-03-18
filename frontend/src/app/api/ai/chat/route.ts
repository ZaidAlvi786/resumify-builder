import { NextRequest, NextResponse } from "next/server";
import { ContextManager } from "@/ai/context/context-manager";
import { PromptOptimizer } from "@/ai/prompt/prompt-optimizer";
import { GeminiClient } from "@/ai/services/gemini-client";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, resumeData, userId } = await req.json();

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    const contextManager = new ContextManager(apiKey);
    const gemini = new GeminiClient(apiKey);

    const userMessage = messages[messages.length - 1].content;

    // 1-3. Enrich prompt with multi-layer context (history, memory, summary)
    const { enrichPromptWithContext } = await import("@/ai/utils/ai-context-utility");
    const optimizedPrompt = await enrichPromptWithContext(apiKey, {
      userId,
      conversationId,
      userMessage,
    });

    // 3. Call Gemini
    const response = await gemini.chat(optimizedPrompt, true);

    if (!response.body) {
      throw new Error("Empty response body from Gemini");
    }

    // 4. Create a TransformStream to intercept and store the response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        // Gemini stream format is usually JSON chunks
        // We'll extract the text parts to store the full message
        try {
          // Note: This is an approximation. Gemini returns multiple JSON objects
          // usually separated by newlines or as a JSON array in streamGenerateContent
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.trim().startsWith("{")) {
              const cleaned = line.trim().replace(/^,/, "");
              const data = JSON.parse(cleaned);
              const part = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (part) assistantMessage += part;
            }
          }
        } catch (e) {
          // Ignore partial JSON parsing errors
        }
        controller.enqueue(chunk);
      },
      async flush() {
        if (assistantMessage) {
          // Save assistant response to DB
          await contextManager.saveMessage(conversationId, "assistant", assistantMessage);
          
          // Background: Extract memory and check for summary
          // In a real app, this should probably be a separate worker or queue
          contextManager.processBackgroundTasks(userId, conversationId);
        }
      }
    });

    const pipedResponse = response.body.pipeThrough(transformStream);

    // 5. Return streaming response
    return new Response(pipedResponse, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
