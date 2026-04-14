import { GeminiService } from './geminiService';
import { ClaudeService } from './claudeService';
import { getLoggingService } from './loggingService';
import { getErrorService } from './errorService';

export type AIProvider = 'gemini' | 'claude';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  modelUsed: string;
}

/**
 * Unified AI service that supports multiple providers (Gemini, Claude)
 */
export class UnifiedAIService {
  private geminiService: GeminiService;
  private claudeService: ClaudeService;
  private currentProvider: AIProvider = 'gemini';
  private loggingService = getLoggingService();
  private errorService = getErrorService();

  constructor(geminiApiKey?: string, claudeApiKey?: string) {
    this.geminiService = new GeminiService(
      geminiApiKey ? { apiKey: geminiApiKey } : undefined
    );
    this.claudeService = new ClaudeService(
      claudeApiKey ? { apiKey: claudeApiKey } : undefined
    );

    // Auto-detect best available provider
    this.detectBestProvider();
  }

  /**
   * Auto-detect the best available provider
   */
  private detectBestProvider(): void {
    if (this.claudeService.isInitialized()) {
      this.currentProvider = 'claude';
      this.loggingService.info(
        'UnifiedAIService',
        'Using Claude as primary provider'
      );
    } else if (this.geminiService.isInitialized()) {
      this.currentProvider = 'gemini';
      this.loggingService.info(
        'UnifiedAIService',
        'Using Gemini as primary provider'
      );
    } else {
      this.loggingService.warn(
        'UnifiedAIService',
        'No AI providers are initialized'
      );
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    if (this.geminiService.isInitialized()) available.push('gemini');
    if (this.claudeService.isInitialized()) available.push('claude');
    return available;
  }

  /**
   * Set the current provider
   */
  setProvider(provider: AIProvider): void {
    if (!this.isProviderAvailable(provider)) {
      const error = new Error(
        `Provider ${provider} is not available or not initialized`
      );
      this.errorService.logError(error, undefined, `${provider} API key not configured.`);
      throw error;
    }
    this.currentProvider = provider;
    this.loggingService.info('UnifiedAIService', `Switched to ${provider} provider`);
  }

  /**
   * Check if a provider is available
   */
  isProviderAvailable(provider: AIProvider): boolean {
    if (provider === 'gemini') return this.geminiService.isInitialized();
    if (provider === 'claude') return this.claudeService.isInitialized();
    return false;
  }

  /**
   * Get current provider
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * Generate content using the current provider
   */
  async generateContent(
    history: AIMessage[],
    userMessage: string
  ): Promise<AIResponse> {
    if (!this.isProviderAvailable(this.currentProvider)) {
      const availableProviders = this.getAvailableProviders();
      if (availableProviders.length > 0) {
        this.setProvider(availableProviders[0]);
      } else {
        throw new Error('No AI providers are available');
      }
    }

    try {
      const provider = this.currentProvider;
      let text: string;
      let modelUsed: string;

      if (provider === 'claude') {
        text = await this.claudeService.generateContent(
          history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userMessage
        );
        modelUsed = 'Claude 3.5 Sonnet';
      } else {
        // Convert to Gemini format
        const geminiHistory = history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          parts: [{ text: msg.content }],
        }));

        const response = await this.geminiService.generateContent(
          geminiHistory,
          userMessage
        );
        text = response.text;
        modelUsed = 'Gemini 2.0 Flash';
      }

      return { text, provider, modelUsed };
    } catch (error) {
      this.loggingService.error(
        'UnifiedAIService',
        `Error generating content with ${this.currentProvider}`,
        { error: error instanceof Error ? error.message : String(error) }
      );
      throw error;
    }
  }

  /**
   * Generate content stream using the current provider
   */
  async generateContentStream(
    history: AIMessage[],
    userMessage: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    if (!this.isProviderAvailable(this.currentProvider)) {
      const availableProviders = this.getAvailableProviders();
      if (availableProviders.length > 0) {
        this.setProvider(availableProviders[0]);
      } else {
        throw new Error('No AI providers are available');
      }
    }

    try {
      const provider = this.currentProvider;
      let fullText: string;

      if (provider === 'claude') {
        fullText = await this.claudeService.generateContentStream(
          history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userMessage,
          onChunk
        );
      } else {
        // Convert to Gemini format
        const geminiHistory = history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          parts: [{ text: msg.content }],
        }));

        const response = await this.geminiService.generateContentStream(
          geminiHistory,
          userMessage,
          onChunk
        );
        fullText = response.fullText;
      }

      return fullText;
    } catch (error) {
      this.loggingService.error(
        'UnifiedAIService',
        `Error generating content stream with ${this.currentProvider}`,
        { error: error instanceof Error ? error.message : String(error) }
      );
      throw error;
    }
  }

  /**
   * Analyze code
   */
  async analyzeCode(code: string, language: string): Promise<string> {
    if (this.currentProvider === 'claude') {
      return this.claudeService.analyzeCode(code, language);
    } else {
      return this.geminiService.analyzeCode(code, language);
    }
  }

  /**
   * Generate test cases
   */
  async generateTestCases(code: string, language: string): Promise<string> {
    if (this.currentProvider === 'claude') {
      return this.claudeService.generateTestCases(code, language);
    } else {
      return this.geminiService.generateTestCases(code, language);
    }
  }
}

// Singleton instance
let unifiedAIServiceInstance: UnifiedAIService | null = null;

export function getUnifiedAIService(): UnifiedAIService {
  if (!unifiedAIServiceInstance) {
    const geminiApiKey =
      (process.env as any).GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    const claudeApiKey =
      (process.env as any).CLAUDE_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY;

    unifiedAIServiceInstance = new UnifiedAIService(geminiApiKey, claudeApiKey);
  }
  return unifiedAIServiceInstance;
}
