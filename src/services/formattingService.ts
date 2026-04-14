// Formatting service without external dependencies
export class FormattingService {
  static formatJSON(code: string): string {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return code;
    }
  }

  static formatHTML(code: string): string {
    let formatted = '';
    let indent = 0;
    let inTag = false;
    let tagName = '';
    const selfClosingTags = ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

    const lines = code.split(/\n/).map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      if (line.startsWith('</')) {
        indent = Math.max(0, indent - 1);
      }

      formatted += '  '.repeat(indent) + line + '\n';

      // Count opening and closing tags
      const openTags = (line.match(/<([a-z][a-z0-9-]*)/gi) || [])
        .filter(tag => !selfClosingTags.some(st => tag.toLowerCase().includes(st)))
        .length;
      const closeTags = (line.match(/<\/[a-z][a-z0-9-]*>/gi) || []).length;
      const selfClosing = (line.match(/<[a-z][a-z0-9-]*[^>]*\/>/gi) || []).length;

      indent += openTags - closeTags - selfClosing;
      indent = Math.max(0, indent);
    }

    return formatted;
  }

  static formatCSS(code: string): string {
    let formatted = '';
    let indent = 0;

    // Add newline after {
    code = code.replace(/\{/g, ' {\n');
    code = code.replace(/\}/g, '\n}\n');
    code = code.replace(/;/g, ';\n');

    const lines = code.split('\n').map(line => line.trim()).filter(line => line);

    for (const line of lines) {
      if (line.startsWith('}')) {
        indent = Math.max(0, indent - 1);
      }

      formatted += '  '.repeat(indent) + line + '\n';

      if (line.endsWith('{')) {
        indent++;
      }
      if (line === '}') {
        indent = Math.max(0, indent - 1);
      }
    }

    return formatted;
  }

  static formatJavaScript(code: string): string {
    let formatted = '';
    let indent = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1];

      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && code[i - 1] !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (inString) {
        formatted += char;
        continue;
      }

      // Handle braces
      if (char === '{') {
        formatted += ' {\n';
        indent++;
        formatted += '  '.repeat(indent);
      } else if (char === '}') {
        if (formatted.endsWith('  '.repeat(indent))) {
          formatted = formatted.slice(0, -2 * indent);
        } else {
          formatted += '\n';
        }
        indent = Math.max(0, indent - 1);
        formatted += '  '.repeat(indent) + '}\n';
        if (nextChar === ';') {
          formatted = formatted.slice(0, -1);
        }
      } else if (char === ';' && !inString) {
        formatted += ';\n' + '  '.repeat(indent);
      } else if (char === '\n') {
        // Skip extra newlines
        if (!formatted.endsWith('\n')) {
          formatted += '\n' + '  '.repeat(indent);
        }
      } else if (char === ' ' && formatted.endsWith(' ')) {
        // Skip extra spaces
        continue;
      } else {
        formatted += char;
      }
    }

    return formatted.trim();
  }

  static formatCode(code: string, language: string): string {
    switch (language) {
      case 'json':
        return this.formatJSON(code);
      case 'html':
        return this.formatHTML(code);
      case 'css':
      case 'scss':
      case 'less':
        return this.formatCSS(code);
      case 'javascript':
      case 'typescript':
        return this.formatJavaScript(code);
      default:
        return code;
    }
  }

  static minifyCode(code: string, language: string): string {
    switch (language) {
      case 'json':
        try {
          return JSON.stringify(JSON.parse(code));
        } catch {
          return code;
        }
      case 'css':
      case 'scss':
      case 'javascript':
        return code
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*/g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,])\s*/g, '$1')
          .trim();
      case 'html':
        return code
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/\s+/g, ' ')
          .replace(/>\s+</g, '><')
          .trim();
      default:
        return code;
    }
  }

  static countLines(code: string): number {
    return code.split('\n').length;
  }

  static countCharacters(code: string): number {
    return code.length;
  }

  static countWords(code: string): number {
    return code.split(/\s+/).filter(word => word).length;
  }

  static getLanguageStats(code: string, language: string) {
    const lines = this.countLines(code);
    const characters = this.countCharacters(code);
    const words = this.countWords(code);

    return {
      lines,
      characters,
      words,
      language,
    };
  }
}
