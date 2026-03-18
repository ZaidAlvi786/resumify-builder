/**
 * Sliding Window Memory
 * Manages the most recent conversation messages within a token budget.
 */
import { estimateMessageTokens } from "../utils/token-estimator";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export class SlidingWindow {
  private messages: Message[] = [];
  private tokenLimit: number;

  constructor(tokenLimit: number) {
    this.tokenLimit = tokenLimit;
  }

  addMessage(message: Message) {
    this.messages.push(message);
    this.enforceLimit();
  }

  setMessages(messages: Message[]) {
    this.messages = messages;
    this.enforceLimit();
  }

  getMessages(): Message[] {
    return this.messages;
  }

  private enforceLimit() {
    let currentTokens = 0;
    const windowMessages: Message[] = [];

    // Keep the most recent messages that fit in the budget
    // We iterate backwards from the latest message
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      const tokens = estimateMessageTokens(msg.role, msg.content);
      
      if (currentTokens + tokens > this.tokenLimit) {
        break;
      }
      
      currentTokens += tokens;
      windowMessages.unshift(msg);
    }

    this.messages = windowMessages;
  }
}
