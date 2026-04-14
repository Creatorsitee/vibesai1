import { GoogleGenAI, Content, Part } from '@google/genai';
import { getErrorService } from './errorService';
import { getLoggingService } from './loggingService';

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

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

const REQUEST_TIMEOUT = 30000; // 30 seconds

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private errorService = getErrorService();
  private loggingService = getLoggingService();
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  constructor(config?: GeminiServiceConfig) {
    if (config?.apiKey && config.apiKey.trim()) {
      try {
        this.client = new GoogleGenAI({ apiKey: config.apiKey });
        this.loggingService.info('GeminiService', 'Gemini API initialized');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.errorService.logError(
          new Error(`Failed to initialize Gemini API: ${errorMsg}`),
          { apiKeyLength: config.apiKey.length },
          'Failed to initialize AI service. Please check your API key.'
        );
      }
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.loggingService.debug(
          'GeminiService',
          `Executing ${operationName} (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`
        );
        return await this.executeWithTimeout(operation(), REQUEST_TIMEOUT);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.loggingService.warn(
          'GeminiService',
          `${operationName} failed (attempt ${attempt + 1}): ${lastError.message}`
        );

        if (attempt < this.retryConfig.maxRetries) {
          this.loggingService.debug(
            'GeminiService',
            `Retrying ${operationName} after ${delay}ms`
          );
          await this.delay(delay);
          delay = Math.min(
            delay * this.retryConfig.backoffMultiplier,
            this.retryConfig.maxDelay
          );
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after retries`);
  }

  /**
   * Execute operation with timeout
   */
  private executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Delay utility for backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateContent(
    history: Content[],
    userMessage: string,
    tools?: any
  ): Promise<{ text: string; parts: Part[] }> {
    if (!this.client) {
      const error = new Error('Gemini API not initialized');
      this.errorService.logError(
        error,
        undefined,
        'API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.'
      );
      throw error;
    }

    return this.retryWithBackoff(async () => {
      const messages: Content[] = [
        ...history,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const result = await this.client!.models.generateContent({
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
    }, 'generateContent');
  }

  async generateContentStream(
    history: Content[],
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<{ fullText: string }> {
    if (!this.client) {
      const error = new Error('Gemini API not initialized');
      this.errorService.logError(
        error,
        undefined,
        'API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.'
      );
      throw error;
    }

    return this.retryWithBackoff(async () => {
      const messages: Content[] = [
        ...history,
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      let fullText = '';
      const result = await this.client!.models.generateContentStream({
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
    }, 'generateContentStream');
  }

  async analyzeCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Analyze this ${language} code for potential issues, best practices, and improvements:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a detailed analysis with suggestions.`;
      const result = await this.generateContent([], prompt);
      this.loggingService.info('GeminiService', 'Code analysis completed successfully');
      return result.text;
    } catch (error) {
      this.errorService.logError(
        error instanceof Error ? error : new Error(String(error)),
        { language, codeLength: code.length },
        'Failed to analyze code. Please try again.'
      );
      throw error;
    }
  }

  async generateTestCases(code: string, language: string): Promise<string> {
    try {
      const prompt = `Generate comprehensive test cases for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude unit tests and edge cases.`;
      const result = await this.generateContent([], prompt);
      this.loggingService.info('GeminiService', 'Test case generation completed successfully');
      return result.text;
    } catch (error) {
      this.errorService.logError(
        error instanceof Error ? error : new Error(String(error)),
        { language, codeLength: code.length },
        'Failed to generate test cases. Please try again.'
      );
      throw error;
    }
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
