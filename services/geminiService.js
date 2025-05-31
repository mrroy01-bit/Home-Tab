import config from '../config.js';

class GeminiService {
    constructor() {
        this.apiKey = config.geminiApiKey;
        this.endpoint = config.apiEndpoint;
    }

    async generateResponse(prompt) {
        try {
            const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    async streamResponse(prompt, onChunk) {
        try {
            const response = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    streamGenerationConfig: {
                        streamType: "TOKEN_STREAM"
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const chunks = buffer.split('\n');
                buffer = chunks.pop() || '';

                for (const chunk of chunks) {
                    if (chunk.trim()) {
                        try {
                            const data = JSON.parse(chunk);
                            const text = data.candidates[0]?.content?.parts[0]?.text || '';
                            if (text) onChunk(text);
                        } catch (e) {
                            console.warn('Error parsing chunk:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error streaming response:', error);
            throw error;
        }
    }
}

export const geminiService = new GeminiService(); 