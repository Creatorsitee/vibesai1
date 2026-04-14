/**
 * Search and replace service for code editor with advanced features
 */

export interface SearchMatch {
  index: number;
  startIndex: number;
  endIndex: number;
  line: number;
  column: number;
  text: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
  multiline?: boolean;
}

export interface ReplaceResult {
  count: number;
  replacedText: string;
  changes: Array<{ from: SearchMatch; to: string }>;
}

export class SearchReplaceService {
  /**
   * Find all matches in text
   */
  static findAll(
    text: string,
    searchTerm: string,
    options: SearchOptions = {}
  ): SearchMatch[] {
    if (!searchTerm) return [];

    const matches: SearchMatch[] = [];
    let pattern: RegExp;

    try {
      if (options.useRegex) {
        const flags = `g${options.caseSensitive ? '' : 'i'}${options.multiline ? 'm' : ''}`;
        pattern = new RegExp(searchTerm, flags);
      } else {
        let escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        if (options.wholeWord) {
          escaped = `\\b${escaped}\\b`;
        }

        const flags = `g${options.caseSensitive ? '' : 'i'}`;
        pattern = new RegExp(escaped, flags);
      }

      const lines = text.split('\n');
      let globalIndex = 0;

      lines.forEach((line, lineNumber) => {
        let match;
        const linePattern = new RegExp(pattern.source, pattern.flags);

        while ((match = linePattern.exec(line)) !== null) {
          const startIndex = globalIndex + match.index;
          const endIndex = startIndex + match[0].length;

          matches.push({
            index: matches.length,
            startIndex,
            endIndex,
            line: lineNumber,
            column: match.index,
            text: match[0],
          });
        }

        globalIndex += line.length + 1; // +1 for newline
      });
    } catch (error) {
      console.error('[SearchReplaceService] Error finding matches:', error);
    }

    return matches;
  }

  /**
   * Find next match from position
   */
  static findNext(
    text: string,
    searchTerm: string,
    fromIndex: number = 0,
    options: SearchOptions = {}
  ): SearchMatch | null {
    const matches = this.findAll(text, searchTerm, options);
    const match = matches.find((m) => m.startIndex >= fromIndex);
    return match || null;
  }

  /**
   * Find previous match from position
   */
  static findPrevious(
    text: string,
    searchTerm: string,
    fromIndex: number = Infinity,
    options: SearchOptions = {}
  ): SearchMatch | null {
    const matches = this.findAll(text, searchTerm, options);
    const match = [...matches].reverse().find((m) => m.startIndex < fromIndex);
    return match || null;
  }

  /**
   * Replace first occurrence
   */
  static replaceFirst(
    text: string,
    searchTerm: string,
    replaceTerm: string,
    options: SearchOptions = {}
  ): string {
    const match = this.findNext(text, searchTerm, 0, options);
    if (!match) return text;

    return text.substring(0, match.startIndex) + replaceTerm + text.substring(match.endIndex);
  }

  /**
   * Replace all occurrences
   */
  static replaceAll(
    text: string,
    searchTerm: string,
    replaceTerm: string,
    options: SearchOptions = {}
  ): ReplaceResult {
    const matches = this.findAll(text, searchTerm, options);

    if (matches.length === 0) {
      return {
        count: 0,
        replacedText: text,
        changes: [],
      };
    }

    let replacedText = text;
    const changes = [];
    let offset = 0;

    for (const match of matches) {
      const adjustedStart = match.startIndex + offset;
      const adjustedEnd = match.endIndex + offset;

      changes.push({
        from: match,
        to: replaceTerm,
      });

      replacedText =
        replacedText.substring(0, adjustedStart) +
        replaceTerm +
        replacedText.substring(adjustedEnd);

      offset += replaceTerm.length - match.text.length;
    }

    return {
      count: matches.length,
      replacedText,
      changes,
    };
  }

  /**
   * Get context around a match
   */
  static getContext(
    text: string,
    match: SearchMatch,
    contextLines: number = 2
  ): {
    before: string[];
    line: string;
    after: string[];
  } {
    const lines = text.split('\n');
    const startLine = Math.max(0, match.line - contextLines);
    const endLine = Math.min(lines.length - 1, match.line + contextLines);

    return {
      before: lines.slice(startLine, match.line),
      line: lines[match.line],
      after: lines.slice(match.line + 1, endLine + 1),
    };
  }

  /**
   * Count occurrences
   */
  static count(
    text: string,
    searchTerm: string,
    options: SearchOptions = {}
  ): number {
    return this.findAll(text, searchTerm, options).length;
  }

  /**
   * Validate regex pattern
   */
  static isValidRegex(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Escape regex special characters
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get suggestions for typos (simple implementation)
   */
  static suggestCorrections(text: string, term: string, maxSuggestions: number = 5): string[] {
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];

    // Simple Levenshtein distance for suggestions
    const suggestions = uniqueWords
      .map((word) => ({
        word,
        distance: this.levenshteinDistance(term.toLowerCase(), word.toLowerCase()),
      }))
      .filter((item) => item.distance <= 2 && item.distance > 0)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map((item) => item.word);

    return suggestions;
  }

  /**
   * Levenshtein distance algorithm
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}

export const searchReplace = SearchReplaceService;
