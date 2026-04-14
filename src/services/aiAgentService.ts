import { GeminiService } from './geminiService';
import { FileService } from './fileService';
import { FormattingService } from './formattingService';
import { Content } from '@google/genai';

export interface SlashCommand {
  name: string;
  description: string;
  handler: (context: CommandContext) => Promise<string>;
}

export interface CommandContext {
  selectedCode?: string;
  activeFile?: string;
  fileContent?: string;
  allFiles?: Record<string, string>;
  query?: string;
}

export class AIAgentService {
  private geminiService: GeminiService;
  private commands: Map<string, SlashCommand> = new Map();

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
    this.initializeCommands();
  }

  private initializeCommands(): void {
    // /generate command
    this.commands.set('generate', {
      name: 'generate',
      description: 'Generate code for a specific task',
      handler: async (context) => {
        const prompt = `Generate production-ready code for: ${context.query}\n\nRequirements:\n- Complete and working\n- Best practices\n- Well-commented\n- Modern patterns`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /debug command
    this.commands.set('debug', {
      name: 'debug',
      description: 'Debug and fix issues in code',
      handler: async (context) => {
        const prompt = `Debug this code and explain the issues:\n\n\`\`\`\n${context.selectedCode || context.fileContent}\n\`\`\`\n\nProvide:\n1. Issues found\n2. Root causes\n3. Fixed code\n4. Explanation`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /test command
    this.commands.set('test', {
      name: 'test',
      description: 'Generate test cases for code',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        const prompt = `Generate comprehensive test cases for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude:\n- Unit tests\n- Edge cases\n- Error handling\n- Test framework (Jest/Vitest)`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /review command
    this.commands.set('review', {
      name: 'review',
      description: 'Review code for quality and best practices',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        const prompt = `Review this ${language} code for:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nAnalyze:\n1. Code quality\n2. Performance\n3. Security issues\n4. Best practices\n5. Suggestions for improvement`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /optimize command
    this.commands.set('optimize', {
      name: 'optimize',
      description: 'Optimize code for performance',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        const prompt = `Optimize this ${language} code for better performance:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:\n1. Performance analysis\n2. Optimization suggestions\n3. Optimized code\n4. Performance improvements (%)`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /explain command
    this.commands.set('explain', {
      name: 'explain',
      description: 'Explain code in detail',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const prompt = `Explain this code in detail:\n\n\`\`\`\n${code}\n\`\`\`\n\nInclude:\n1. What it does\n2. How it works\n3. Key concepts\n4. Best practices used`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /refactor command
    this.commands.set('refactor', {
      name: 'refactor',
      description: 'Refactor code for better maintainability',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        const prompt = `Refactor this ${language} code for better maintainability and readability:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:\n1. Current issues\n2. Refactored code\n3. Improvements explained\n4. Benefits`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /document command
    this.commands.set('document', {
      name: 'document',
      description: 'Generate documentation for code',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        const prompt = `Generate comprehensive documentation for this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nInclude:\n1. Function descriptions\n2. Parameters\n3. Return values\n4. Usage examples\n5. Edge cases`;
        const result = await this.geminiService.generateContent([], prompt);
        return result.text;
      },
    });

    // /format command
    this.commands.set('format', {
      name: 'format',
      description: 'Format code according to best practices',
      handler: async (context) => {
        const code = context.selectedCode || context.fileContent;
        const language = context.activeFile ? FileService.getLanguageFromExtension(context.activeFile) : 'javascript';
        try {
          const formatted = FormattingService.formatCode(code, language);
          return formatted;
        } catch (error) {
          return `Error formatting code: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      },
    });

    // /help command
    this.commands.set('help', {
      name: 'help',
      description: 'Show available commands',
      handler: async () => {
        const commands = Array.from(this.commands.values());
        const helpText = commands
          .map(cmd => `**/${cmd.name}** - ${cmd.description}`)
          .join('\n\n');
        return `Available AI Commands:\n\n${helpText}\n\nUsage: Type a slash command followed by your request or select code and use a command.`;
      },
    });
  }

  parseSlashCommand(message: string): { command?: string; query: string } {
    const match = message.match(/^\/(\w+)\s*(.*)/);
    if (match) {
      return { command: match[1], query: match[2] };
    }
    return { query: message };
  }

  async executeCommand(command: string, context: CommandContext): Promise<string> {
    const slashCommand = this.commands.get(command.toLowerCase());
    if (!slashCommand) {
      return `Unknown command: /${command}. Type /help for available commands.`;
    }

    try {
      return await slashCommand.handler(context);
    } catch (error) {
      return `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  getAvailableCommands(): SlashCommand[] {
    return Array.from(this.commands.values());
  }

  hasCommand(name: string): boolean {
    return this.commands.has(name.toLowerCase());
  }

  async processMessage(
    message: string,
    context: CommandContext,
    history: Content[]
  ): Promise<{ isCommand: boolean; response: string }> {
    const parsed = this.parseSlashCommand(message);

    if (parsed.command && this.hasCommand(parsed.command)) {
      const response = await this.executeCommand(parsed.command, {
        ...context,
        query: parsed.query,
      });
      return { isCommand: true, response };
    }

    // Regular chat message
    const result = await this.geminiService.generateContent(history, message);
    return { isCommand: false, response: result.text };
  }
}

export const createAIAgent = (geminiService: GeminiService): AIAgentService => {
  return new AIAgentService(geminiService);
};
