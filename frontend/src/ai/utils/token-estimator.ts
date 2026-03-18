/**
 * Token Estimator Utility
 * Simple heuristic-based token estimation (approx 4 chars per token).
 * In a real production system, this should use a library like js-tiktoken.
 */

export const estimateTokens = (text: string | null | undefined): number => {
  if (!text) return 0;
  // Heuristic: 1 token is roughly 4 characters for English text
  return Math.ceil(text.length / 4);
};

export const estimateMessageTokens = (role: string, content: string): number => {
  // Add some overhead for JSON structure/role name
  return estimateTokens(content) + 10;
};

export const truncateToTokenLimit = (text: string, limit: number): string => {
  const currentTokens = estimateTokens(text);
  if (currentTokens <= limit) return text;

  // Approximate character limit
  const charLimit = limit * 4;
  return text.slice(0, charLimit) + "... [truncated]";
};
