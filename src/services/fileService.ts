import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

export class FileService {
  static getLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      txt: 'plaintext',
    };
    return languageMap[ext || ''] || 'plaintext';
  }

  static isTextFile(filename: string): boolean {
    const textExtensions = [
      'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'rb', 'go',
      'rs', 'php', 'swift', 'kt', 'sql', 'html', 'css', 'scss', 'less', 'json',
      'xml', 'yaml', 'yml', 'md', 'txt', 'env', 'properties', 'conf', 'config',
      'sh', 'bash', 'zsh', 'vim', 'gradle', 'maven', 'npm'
    ];
    const ext = filename.split('.').pop()?.toLowerCase();
    return textExtensions.includes(ext || '');
  }

  static buildFileTree(files: Record<string, string>): FileNode {
    const root: FileNode = {
      name: 'root',
      type: 'folder',
      path: '/',
      children: [],
    };

    // Sort files by path
    const sortedPaths = Object.keys(files).sort();

    for (const filepath of sortedPaths) {
      const parts = filepath.split('/').filter(p => p);
      let current = root;

      // Navigate/create folder structure
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        let folder = current.children?.find(
          c => c.name === folderName && c.type === 'folder'
        );

        if (!folder) {
          folder = {
            name: folderName,
            type: 'folder',
            path: `${current.path}${folderName}/`,
            children: [],
          };
          if (!current.children) current.children = [];
          current.children.push(folder);
        }
        current = folder;
      }

      // Add file
      const fileName = parts[parts.length - 1];
      const file: FileNode = {
        name: fileName,
        type: 'file',
        path: filepath,
        content: files[filepath],
      };

      if (!current.children) current.children = [];
      current.children.push(file);
    }

    // Sort children
    if (root.children) {
      this.sortChildren(root);
    }

    return root;
  }

  private static sortChildren(node: FileNode): void {
    if (!node.children) return;

    node.children.sort((a, b) => {
      // Folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });

    node.children.forEach(child => {
      if (child.type === 'folder') {
        this.sortChildren(child);
      }
    });
  }

  static async exportProjectAsZip(projectName: string, files: Record<string, string>) {
    const zip = new JSZip();

    for (const [filepath, content] of Object.entries(files)) {
      zip.file(filepath, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName}.zip`);
  }

  static async importFromZip(file: File): Promise<Record<string, string>> {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);

    const files: Record<string, string> = {};

    for (const [path, fileObj] of Object.entries(loaded.files)) {
      if (!fileObj.dir && this.isTextFile(path)) {
        try {
          files[path] = await fileObj.async('string');
        } catch (e) {
          console.warn(`Failed to import ${path}:`, e);
        }
      }
    }

    return files;
  }

  static calculateProjectStats(files: Record<string, string>) {
    const stats = {
      totalFiles: Object.keys(files).length,
      totalLines: 0,
      totalCharacters: 0,
      filesByType: {} as Record<string, number>,
      linesByType: {} as Record<string, number>,
    };

    for (const [filepath, content] of Object.entries(files)) {
      const ext = filepath.split('.').pop()?.toLowerCase() || 'other';
      stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;

      const lines = content.split('\n').length;
      stats.totalLines += lines;
      stats.linesByType[ext] = (stats.linesByType[ext] || 0) + lines;
      stats.totalCharacters += content.length;
    }

    return stats;
  }

  static searchInFiles(files: Record<string, string>, query: string, caseSensitive = false): Array<{
    file: string;
    line: number;
    content: string;
  }> {
    const results: Array<{ file: string; line: number; content: string }> = [];
    const searchRegex = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      caseSensitive ? 'g' : 'gi'
    );

    for (const [filepath, content] of Object.entries(files)) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (searchRegex.test(line)) {
          results.push({
            file: filepath,
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }

    return results;
  }
}
