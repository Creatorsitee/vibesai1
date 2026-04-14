import { getErrorService } from './errorService';
import { getLoggingService } from './loggingService';

export interface ClaudeConfig {
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
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

const SYSTEM_PROMPT = `Anda adalah VibesAI Claude, sebuah AI developer assistant yang ahli dalam:
- Pemrograman web (HTML, CSS, JavaScript, TypeScript, React, Vue)
- Mobile development (React Native, Flutter)
- Backend development (Node.js, Python, Go, Rust)
- Database design dan optimization
- UI/UX design principles
- DevOps dan cloud services
- Testing dan debugging

Anda membantu developer menulis code yang clean, efficient, dan well-documented. Anda juga memberikan penjelasan yang detail tentang konsep-konsep pemrograman.

Ketika user meminta code, selalu:
1. Jelaskan approach yang akan digunakan
2. Berikan code dengan comments yang jelas
3. Jelaskan cara menggunakan code tersebut
4. Berikan tips untuk optimization jika relevan`;

export class ClaudeService {
  private apiKey: string | null = null;
  private errorService = getErrorService();
  private loggingService = getLoggingService();
  private retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  constructor(config?: ClaudeConfig) {
    if (config?.apiKey && config.apiKey.trim()) {
      this.apiKey = config.apiKey;
      this.loggingService.info('ClaudeService', 'Claude API initialized');
    }
  }

  isInitialized(): boolean {
    return this.apiKey !== null && this.apiKey.trim().length > 0;
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
          'ClaudeService',
          `Executing ${operationName} (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`
        );
        return await this.executeWithTimeout(operation(), REQUEST_TIMEOUT);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.loggingService.warn(
          'ClaudeService',
          `${operationName} failed (attempt ${attempt + 1}): ${lastError.message}`
        );

        if (attempt < this.retryConfig.maxRetries) {
          this.loggingService.debug(
            'ClaudeService',
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

  /**
   * Send a message to Claude and get a response
   */
  async generateContent(
    history: Array<{ role: string; content: string }>,
    userMessage: string
  ): Promise<string> {
    if (!this.isInitialized()) {
      const error = new Error('Claude API not initialized');
      this.errorService.logError(
        error,
        undefined,
        'API key not configured. Please set VITE_CLAUDE_API_KEY in your environment variables.'
      );
      throw error;
    }

    return this.retryWithBackoff(async () => {
      const messages = [
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Claude API error: ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      const textContent = data.content.find(
        (block: any) => block.type === 'text'
      );

      if (!textContent) {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    }, 'generateContent');
  }

  /**
   * Stream a message to Claude
   */
  async generateContentStream(
    history: Array<{ role: string; content: string }>,
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.isInitialized()) {
      const error = new Error('Claude API not initialized');
      this.errorService.logError(
        error,
        undefined,
        'API key not configured. Please set VITE_CLAUDE_API_KEY in your environment variables.'
      );
      throw error;
    }

    return this.retryWithBackoff(async () => {
      const messages = [
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Claude API error: ${errorData.error?.message || response.statusText}`
        );
      }

      let fullText = '';

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (
                data.type === 'content_block_delta' &&
                data.delta.type === 'text_delta'
              ) {
                const text = data.delta.text;
                fullText += text;
                onChunk(text);
              }
            } catch (e) {
              // Ignore JSON parse errors for streaming
            }
          }
        }
      }

      return fullText;
    }, 'generateContentStream');
  }

  /**
   * Analyze code
   */
  async analyzeCode(code: string, language: string): Promise<string> {
    try {
      const prompt = `Analyze this ${language} code for potential issues, best practices, and improvements:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a detailed analysis with suggestions.`;
      const result = await this.generateContent([], prompt);
      this.loggingService.info('ClaudeService', 'Code analysis completed successfully');
      return result;
    } catch (error) {
      this.errorService.logError(
        error instanceof Error ? error : new Error(String(error)),
        { language, codeLength: code.length },
        'Failed to analyze code. Please try again.'
      );
      throw error;
    }
  }

  /**
   * Generate test cases
   */
  async generateTestCases(code: string, language: string): Promise<string> {
    try {
      const prompt = `Generate comprehensive test cases for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude unit tests and edge cases.`;
      const result = await this.generateContent([], prompt);
      this.loggingService.info('ClaudeService', 'Test case generation completed successfully');
      return result;
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

// Singleton instance
let claudeServiceInstance: ClaudeService | null = null;

export function getClaudeService(): ClaudeService {
  if (!claudeServiceInstance) {
    const apiKey =
      (process.env as any).CLAUDE_API_KEY ||
      import.meta.env.VITE_CLAUDE_API_KEY;
    claudeServiceInstance = new ClaudeService(
      apiKey ? { apiKey } : undefined
    );
  }
  return claudeServiceInstance;
}
