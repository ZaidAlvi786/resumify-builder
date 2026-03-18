/**
 * Summary Manager
 * Periodically summarizes conversation segments to compress history.
 */
import { GeminiClient } from "../services/gemini-client";
import { supabase } from "../../lib/supabase";

export class SummaryManager {
  private gemini: GeminiClient;

  constructor(apiKey: string) {
    this.gemini = new GeminiClient(apiKey);
  }

  async summarizeInBatch(conversationId: string, messages: any[]) {
    if (messages.length < 10) return; // Only summarize larger chunks

    const textToSummarize = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
Summarize the following conversation segment concisely. 
Focus on:
- User's primary goals
- Decisions made
- Important technical facts or preferences mentioned

Conversation:
${textToSummarize}

Summary:
`;

    const response = await this.gemini.chat(prompt);
    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;

    const { error } = await supabase
      .from("chat_summaries")
      .insert({
        conversation_id: conversationId,
        content: summary,
        last_message_id: messages[messages.length - 1].id,
      });

    if (error) throw error;
    return summary;
  }
}
