/**
 * Context Manager Service
 * Central service for gathering multi-layer context.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { TokenBudgetManager } from "./token-budget";
import { SlidingWindow, Message } from "./sliding-window";
import { EmbeddingService } from "../memory/embedding-service";
import { estimateTokens } from "../utils/token-estimator";
import { supabase } from "../../lib/supabase";

export class ContextManager {
  private budgetManager: TokenBudgetManager;
  private slidingWindow: SlidingWindow;
  private embeddingService: EmbeddingService;
  private db: SupabaseClient;

  /** `db` lets the server route inject a request-authenticated client so
   *  Row-Level Security authorises the conversation/message reads & writes.
   *  Defaults to the browser anon client. */
  constructor(apiKey: string, db: SupabaseClient = supabase) {
    this.db = db;
    this.budgetManager = new TokenBudgetManager();
    const budget = this.budgetManager.getBudget();
    this.slidingWindow = new SlidingWindow(budget.window);
    this.embeddingService = new EmbeddingService(apiKey, db);
  }

  async initializeConversation(conversationId: string) {
    const { data: messages, error } = await this.db
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error loading chat history:", error);
      return;
    }

    if (messages) {
      // populate sliding window in correct chronological order
      this.slidingWindow.setMessages(messages.reverse() as any);
    }
  }

  async saveMessage(conversationId: string, role: "user" | "assistant", content: string) {
    const { data, error } = await this.db
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tokens: estimateTokens(content),
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }

    // Generate embedding in background (don't await to keep chat responsive if possible)
    // Actually, for consistency we might want to await or handle it in a queue
    this.embeddingService.createAndStoreEmbedding(data.id, content).catch(err => {
      console.error("Error generating embedding:", err);
    });

    return data;
  }

  async processBackgroundTasks(userId: string, conversationId: string) {
    try {
      // 1. Load latest messages to check if we need memory extraction or summary
      const { data: messages } = await this.db
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!messages) return;

      // 2. Extract memory (every 5 messages or so)
      if (messages.length % 5 === 0) {
        const { MemoryExtractor } = await import("../memory/memory-extractor");
        const extractor = new MemoryExtractor(this.embeddingService["gemini"]["apiKey"]);
        await extractor.extractAndStore(userId, messages);
      }

      // 3. Summarize (if more than 20 messages and no recent summary)
      if (messages.length > 20 && messages.length % 20 === 0) {
        const { SummaryManager } = await import("./summary-manager");
        const summarizer = new SummaryManager(this.embeddingService["gemini"]["apiKey"]);
        await summarizer.summarizeInBatch(conversationId, messages);
      }
    } catch (err) {
      console.error("Background task error:", err);
    }
  }

  async constructContext(
    conversationId: string,
    userMessage: string,
    userId: string
  ): Promise<string> {
    const budget = this.budgetManager.getBudget();

    // 1. Get Long-Term Memory (User Profile/Facts)
    const { data: memories } = await this.db
      .from("user_memories")
      .select("fact_type, content")
      .eq("user_id", userId)
      .limit(10);

    const memoryContext = memories
      ?.map((m) => `[${m.fact_type}]: ${m.content}`)
      .join("\n") || "No stored user memories.";

    // 2. Get Recent Summary
    const { data: latestSummary } = await this.db
      .from("chat_summaries")
      .select("content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const summaryContext = latestSummary?.content || "No previous summary available.";

    // 3. Get Vector-based relevant historical context
    const userEmbedding = await this.embeddingService["gemini"].generateEmbedding(userMessage);
    const similarMessages = await this.embeddingService.searchSimilarMessages(
      userEmbedding,
      conversationId,
      5
    );

    const relevantContext = similarMessages
      ?.map((m: any) => `${m.role}: ${m.content}`)
      .join("\n") || "No relevant historical snippets found.";

    // 4. Assemble Sliding Window (handled by this.slidingWindow)
    // In a real app, you'd load the latest messages from DB into the window first
    const recentMessages = this.slidingWindow.getMessages()
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    // 5. Final Assembly (Prompt Builder Logic)
    return `
SYSTEM INSTRUCTIONS
You are a high-level AI Assistant specialized in resume building and career advice.
Be professional, encouraging, and highly specific.

USER PERSISTENT MEMORY
${memoryContext}

CONVERSATION SUMMARY
${summaryContext}

RELEVANT HISTORICAL FRAGMENTS (Found via Semantic Search)
${relevantContext}

RECENT CONVERSATION (Sliding Window)
${recentMessages}

CURRENT USER REQUEST
${userMessage}
`;
  }
}
