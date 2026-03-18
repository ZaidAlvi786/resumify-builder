/**
 * Memory Extraction Service
 * Analyzes conversation content to extract persistent user facts.
 */
import { GeminiClient } from "../services/gemini-client";
import { supabase } from "../../lib/supabase";

export class MemoryExtractor {
  private gemini: GeminiClient;

  constructor(apiKey: string) {
    this.gemini = new GeminiClient(apiKey);
  }

  async extractAndStore(userId: string, messages: any[]) {
    const textToAnalyze = messages
      .slice(-10) // Only analyze recent context
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
Analyze the following conversation and extract persistent facts about the user.
Ignore transient context (like a specific bug being fixed) and focus on:
- User's tech stack preferences
- Career goals
- Specific industries of interest
- Personal preferences (e.g., "I prefer concise resumes")

Format as JSON list: [{"fact_type": "type", "content": "fact", "confidence": 0.0-1.0}]

Conversation:
${textToAnalyze}

Extraction:
`;

    const response = await this.gemini.chat(prompt);
    const data = await response.json();
    const rawContent = data.candidates[0].content.parts[0].text;
    
    // Clean JSON if needed (Gemini sometimes adds markdown blocks)
    const jsonStr = rawContent.replace(/```json|```/g, "").trim();
    const extractedMemories = JSON.parse(jsonStr);

    for (const memory of extractedMemories) {
      const { error } = await supabase
        .from("user_memories")
        .upsert({
          user_id: userId,
          fact_type: memory.fact_type,
          content: memory.content,
          confidence: memory.confidence,
        }, { onConflict: "user_id, fact_type" }); // We need a unique constraint on these for upsert
        
      if (error) console.error("Memory store error:", error);
    }
  }
}
