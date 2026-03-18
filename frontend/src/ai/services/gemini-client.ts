/**
 * Gemini API Client
 * Simplified direct integration with Gemini API.
 */

export class GeminiClient {
  private apiKey: string;
  private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      `${this.baseUrl}/models/embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding.values;
  }

  async chat(prompt: string, stream: boolean = false): Promise<any> {
    const endpoint = stream ? "streamGenerateContent" : "generateContent";
    const response = await fetch(
      `${this.baseUrl}/models/gemini-1.5-flash:${endpoint}?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini Chat API error: ${response.statusText}`);
    }

    return response;
  }
}
