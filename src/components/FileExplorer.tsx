import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Trash2 } from 'lucide-react';
import { FileNode, FileService } from '../services/fileService';

interface FileExplorerProps {
  fileTree: FileNode;
  activeFile: string;
  onFileSelect: (path: string) => void;
  onFileDelete: (path: string) => void;
  onFileCreate?: (path: string) => void;
}

interface ExpandedState {
  [key: string]: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileTree,
  activeFile,
  onFileSelect,
  onFileDelete,
  onFileCreate,
}) => {
  const [expanded, setExpanded] = useState<ExpandedState>({
    '/': true,
  });

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return <File size={16} className="text-zinc-400" />;
  };

  const renderNode = (node: FileNode, depth = 0) => {
    if (node.type === 'folder') {
      const isExpanded = expanded[node.path];
      return (
        <div key={node.path}>
          <div
            onClick={(e) => toggleFolder(node.path, e)}
            className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer rounded"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-zinc-500" />
            ) : (
              <ChevronRight size={16} className="text-zinc-500" />
            )}
            <Folder size={16} className="text-blue-400" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
              {node.name}
            </span>
          </div>
          {isExpanded && node.children && (
            <div style={{ marginLeft: '12px' }}>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File node
    return (
      <div
        key={node.path}
        onClick={() => onFileSelect(node.path)}
        className={`flex items-center justify-between gap-2 px-2 py-1 rounded cursor-pointer text-sm group ${
          activeFile === node.path
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
            : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFileIcon(node.name)}
          <span className="truncate">{node.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFileDelete(node.path);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
          title="Delete file"
        >
          <Trash2 size={14} className="text-red-600 dark:text-red-400" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
      <div className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-2 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Files</h3>
        {onFileCreate && (
          <button
            onClick={() => {
              const filename = prompt('Enter filename:');
              if (filename) onFileCreate(filename);
            }}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
            title="Create new file"
          >
            <Plus size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        )}
      </div>
      <div className="p-2">
        {fileTree.children?.map(node => renderNode(node))}
      </div>
    </div>
  );
};
