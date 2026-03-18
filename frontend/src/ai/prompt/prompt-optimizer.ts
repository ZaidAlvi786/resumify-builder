/**
 * Prompt Optimizer
 * Refines the prompt to maximize density and relevance while minimizing tokens.
 */
import { estimateTokens, truncateToTokenLimit } from "../utils/token-estimator";

export class PromptOptimizer {
  static optimize(prompt: string, limit: number): string {
    const currentTokens = estimateTokens(prompt);
    if (currentTokens <= limit) return prompt;

    // Strategies:
    // 1. Remove systemic noise (excessive whitespace)
    let optimized = prompt.replace(/\s+/g, ' ').trim();

    // 2. Truncate if still over limit
    if (estimateTokens(optimized) > limit) {
      optimized = truncateToTokenLimit(optimized, limit);
    }

    return optimized;
  }

  static compressContext(text: string): string {
    // Simple heuristic to remove fluff words
    const stopWords = new Set(["the", "a", "an", "and", "or", "but"]);
    return text
      .split(" ")
      .filter((word) => !stopWords.has(word.toLowerCase()))
      .join(" ");
  }
}
