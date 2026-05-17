/**
 * Embedding Service
 * Handles text embedding generation and vector storage/retrieval via Supabase.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { GeminiClient } from "../services/gemini-client";
import { supabase } from "../../lib/supabase";

export class EmbeddingService {
  private gemini: GeminiClient;
  private db: SupabaseClient;

  /** `db` lets the server route inject a request-authenticated client so
   *  Row-Level Security authorises the reads/writes. Defaults to the
   *  browser anon client for client-side use. */
  constructor(apiKey: string, db: SupabaseClient = supabase) {
    this.gemini = new GeminiClient(apiKey);
    this.db = db;
  }

  async createAndStoreEmbedding(messageId: string, content: string) {
    const embedding = await this.gemini.generateEmbedding(content);

    const { error } = await this.db
      .from("chat_messages")
      .update({ embedding })
      .eq("id", messageId);

    if (error) throw error;
  }

  async searchSimilarMessages(embedding: number[], conversationId: string, limit: number = 5) {
    // We use a Supabase RPC call for vector similarity search
    // This requires a postgres function defined in the database
    const { data, error } = await this.db.rpc("match_chat_messages", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      p_conversation_id: conversationId,
    });

    if (error) throw error;
    return data;
  }
}
