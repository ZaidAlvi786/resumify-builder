/**
 * Token Budget Manager
 * Allocates token quotas for different prompt sections to stay within model limits.
 */

export interface TokenBudgetAllocation {
  system: number;
  summary: number;
  memory: number; // Vector retrieval
  window: number; // Recent messages
  user: number;   // Current message
  generation: number; // Response limit
}

export const GEMINI_2_FLASH_LIMIT = 1048576; // 1M tokens
export const SAFE_PROMPT_LIMIT = 32000; // Aim for lower for speed and cost efficiency

export const DEFAULT_BUDGET: TokenBudgetAllocation = {
  system: 2000,
  summary: 3000,
  memory: 5000,
  window: 10000,
  user: 4000,
  generation: 4000,
};

export class TokenBudgetManager {
  private budget: TokenBudgetAllocation;

  constructor(customBudget?: Partial<TokenBudgetAllocation>) {
    this.budget = { ...DEFAULT_BUDGET, ...customBudget };
  }

  getBudget(): TokenBudgetAllocation {
    return this.budget;
  }

  getTotalInputLimit(): number {
    return (
      this.budget.system +
      this.budget.summary +
      this.budget.memory +
      this.budget.window +
      this.budget.user
    );
  }
}
