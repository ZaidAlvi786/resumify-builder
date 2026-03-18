/**
 * Embedding Service
 * Handles text embedding generation and vector storage/retrieval via Supabase.
 */
import { GeminiClient } from "../services/gemini-client";
import { supabase } from "../../lib/supabase";

export class EmbeddingService {
  private gemini: GeminiClient;

  constructor(apiKey: string) {
    this.gemini = new GeminiClient(apiKey);
  }

  async createAndStoreEmbedding(messageId: string, content: string) {
    const embedding = await this.gemini.generateEmbedding(content);
    
    const { error } = await supabase
      .from("chat_messages")
      .update({ embedding })
      .eq("id", messageId);

    if (error) throw error;
  }

  async searchSimilarMessages(embedding: number[], conversationId: string, limit: number = 5) {
    // We use a Supabase RPC call for vector similarity search
    // This requires a postgres function defined in the database
    const { data, error } = await supabase.rpc("match_chat_messages", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      p_conversation_id: conversationId,
    });

    if (error) throw error;
    return data;
  }
}
