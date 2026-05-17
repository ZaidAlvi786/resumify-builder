/**
 * AI Context Utility
 * Helper functions to wrap AI logic and provide consistent context enhancement.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { ContextManager } from "../context/context-manager";
import { PromptOptimizer } from "../prompt/prompt-optimizer";

export interface AIEnrichmentOptions {
  userId: string;
  conversationId: string;
  userMessage: string;
  promptLimit?: number;
}

export async function enrichPromptWithContext(
  apiKey: string,
  options: AIEnrichmentOptions,
  db?: SupabaseClient
) {
  const contextManager = new ContextManager(apiKey, db);
  const { userId, conversationId, userMessage, promptLimit = 30000 } = options;

  // 1. Initialize history
  await contextManager.initializeConversation(conversationId);

  // 2. Save user message
  await contextManager.saveMessage(conversationId, "user", userMessage);

  // 3. Construct context
  const enrichedPrompt = await contextManager.constructContext(
    conversationId,
    userMessage,
    userId
  );

  // 4. Optimize
  return PromptOptimizer.optimize(enrichedPrompt, promptLimit);
}
