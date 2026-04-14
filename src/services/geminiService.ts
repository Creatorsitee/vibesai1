import { GoogleGenAI, Content, Part } from '@google/genai';

const SYSTEM_PROMPT = `Anda adalah VibesAI, sebuah AI developer assistant yang ahli dalam:
- Menghasilkan kode berkualitas tinggi untuk berbagai bahasa pemrograman
- Debugging dan troubleshooting code
- Code review dan optimization
- Menjelaskan konsep pemrograman
- Membantu dengan web development (HTML, CSS, JavaScript, React, Vue, Angular)
- Membantu dengan backend development (Node.js, Python, Go, Rust)
- Database design dan SQL queries
- Architecture dan system design

Ketika pengguna meminta kode, selalu:
1. Berikan kode yang complete dan working
2. Gunakan best practices dan modern patterns
3. Tambahkan comments untuk bagian yang penting
4. Jelaskan apa yang Anda lakukan

Format untuk code blocks:
\`\`\`[language]
[code here]
\`\`\`

Anda juga memiliki akses ke tools berikut:
- generateCode: Generate code untuk use case tertentu
- debugCode: Analyze dan fix bugs dalam code
- refactorCode: Improve code quality dan performance
- explainCode: Explain kode yang complex
- generateTests: Generate test cases untuk code

Selalu helpful, professional, dan jangan takut untuk bertanya clarifying questions jika diperlukan.`;

export interface GeminiServiceConfig {
  apiKey: string;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor(config?: GeminiServiceConfig) {
    if (config?.apiKey && config.apiKey.trim()) {
      this.client = new GoogleGenAI({ apiKey: config.apiKey });
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  async generateContent(
    history: Content[],
    userMessage: string,
    tools?: any
  ): Promise<{ text: string; parts: Part[] }> {
    if (!this.client) {
      throw new Error('Gemini API not initialized');
    }

    const messages: Content[] = [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const result = await this.client.models.generateContent({
      model: 'gemini-2.0-flash',
      systemPrompt: SYSTEM_PROMPT,
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
      tools: tools ? [{ googleSearch: {} }] : undefined,
    });

    const response = result.response;
    const text = response.text();
    const parts = response.content?.parts || [];

    return { text, parts };
  }

  async generateContentStream(
    history: Content[],
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<{ fullText: string }> {
    if (!this.client) {
      throw new Error('Gemini API not initialized');
    }

    const messages: Content[] = [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    let fullText = '';

    const result = await this.client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      systemPrompt: SYSTEM_PROMPT,
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    for await (const event of result.stream) {
      if (event.text) {
        fullText += event.text;
        onChunk(event.text);
      }
    }

    return { fullText };
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    const prompt = `Analyze this ${language} code for potential issues, best practices, and improvements:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a detailed analysis with suggestions.`;
    const result = await this.generateContent([], prompt);
    return result.text;
  }

  async generateTestCases(code: string, language: string): Promise<string> {
    const prompt = `Generate comprehensive test cases for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude unit tests and edge cases.`;
    const result = await this.generateContent([], prompt);
    return result.text;
  }
}

// Create singleton instance
let instance: GeminiService | null = null;

export const getGeminiService = (apiKey?: string): GeminiService => {
  if (!instance) {
    instance = new GeminiService(apiKey ? { apiKey } : undefined);
  }
  return instance;
};
