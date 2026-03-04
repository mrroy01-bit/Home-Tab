import config from "../config.js";

class GeminiService {
  constructor() {
    this.apiKey = null;
    this.endpoint = config.apiEndpoint;
    this.loadApiKey();
  }

  async loadApiKey() {
    return new Promise((resolve) => {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.sync
      ) {
        chrome.storage.sync.get(["geminiApiKey"], (result) => {
          this.apiKey = result.geminiApiKey || null;
          resolve(this.apiKey);
        });
      } else {
        // Fallback to localStorage
        this.apiKey = localStorage.getItem("geminiApiKey") || null;
        resolve(this.apiKey);
      }
    });
  }

  async ensureApiKey() {
    if (!this.apiKey) {
      await this.loadApiKey();
    }
    if (!this.apiKey) {
      throw new Error(
        "API key not configured. Please set your Gemini API key in extension settings."
      );
    }
    return this.apiKey;
  }

  async generateResponse(prompt) {
    try {
      const apiKey = await this.ensureApiKey();

      const response = await fetch(`${this.endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }

  async streamResponse(prompt, onChunk) {
    try {
      const apiKey = await this.ensureApiKey();

      const response = await fetch(`${this.endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          streamGenerationConfig: {
            streamType: "TOKEN_STREAM",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (chunk.trim()) {
            try {
              const data = JSON.parse(chunk);
              const text = data.candidates[0]?.content?.parts[0]?.text || "";
              if (text) onChunk(text);
            } catch (e) {
              console.warn("Error parsing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming response:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
