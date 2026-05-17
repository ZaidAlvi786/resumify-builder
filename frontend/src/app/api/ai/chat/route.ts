import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ContextManager } from "@/ai/context/context-manager";
import { GeminiClient } from "@/ai/services/gemini-client";

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, userId, accessToken } = await req.json();

    if (!conversationId || !userId || !accessToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages must be a non-empty array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server" },
        { status: 503 },
      );
    }

    // A Supabase client acting AS the signed-in user: the route runs
    // server-side, so RLS only authorises the conversation/message writes
    // when the request carries the user's JWT.
    const authedDb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );

    // Ensure the conversation row exists — chat_messages.conversation_id
    // is a foreign key onto it. Idempotent: a no-op if it already exists.
    const { error: convError } = await authedDb
      .from("chat_conversations")
      .upsert({ id: conversationId, user_id: userId }, { onConflict: "id" });
    if (convError) {
      return NextResponse.json(
        { error: `Could not open conversation: ${convError.message}` },
        { status: 403 },
      );
    }

    const contextManager = new ContextManager(apiKey, authedDb);
    const gemini = new GeminiClient(apiKey);

    const userMessage = messages[messages.length - 1].content;

    // Enrich the prompt with multi-layer context (history, memory, summary).
    const { enrichPromptWithContext } = await import("@/ai/utils/ai-context-utility");
    const optimizedPrompt = await enrichPromptWithContext(
      apiKey,
      { userId, conversationId, userMessage },
      authedDb,
    );

    // Call Gemini (streaming).
    const response = await gemini.chat(optimizedPrompt, true);
    if (!response.body) {
      throw new Error("Empty response body from Gemini");
    }

    // Intercept the stream to persist the full assistant reply.
    const decoder = new TextDecoder();
    let assistantMessage = "";

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        try {
          // Gemini streamGenerateContent emits newline-separated JSON objects.
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.trim().startsWith("{")) {
              const cleaned = line.trim().replace(/^,/, "");
              const data = JSON.parse(cleaned);
              const part = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (part) assistantMessage += part;
            }
          }
        } catch {
          // Ignore partial-JSON parse errors mid-stream.
        }
        controller.enqueue(chunk);
      },
      async flush() {
        if (assistantMessage) {
          await contextManager.saveMessage(conversationId, "assistant", assistantMessage);
          // Fire-and-forget memory extraction / summarisation.
          void contextManager.processBackgroundTasks(userId, conversationId);
        }
      },
    });

    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("AI Chat Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
