import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Trash2, Search, Copy, Edit2, Eye } from 'lucide-react';
import { FileNode, FileService } from '../services/fileService';

interface AdvancedFileManagerProps {
  fileTree: FileNode;
  activeFile: string;
  onFileSelect: (path: string) => void;
  onFileDelete: (path: string) => void;
  onFileCreate?: (path: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
}

interface ExpandedState {
  [key: string]: boolean;
}

interface ContextMenu {
  x: number;
  y: number;
  path: string;
  type: 'file' | 'folder';
}

export const AdvancedFileManager: React.FC<AdvancedFileManagerProps> = ({
  fileTree,
  activeFile,
  onFileSelect,
  onFileDelete,
  onFileCreate,
  onFileRename,
}) => {
  const [expanded, setExpanded] = useState<ExpandedState>({ '/': true });
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const results: Array<{ path: string; name: string }> = [];
    const traverse = (node: FileNode) => {
      if (node.type === 'file') {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ path: node.path, name: node.name });
        }
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    };

    fileTree.children?.forEach(traverse);
    return results;
  }, [fileTree, searchQuery]);

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, path: string, type: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path,
      type,
    });
  };

  const startRename = (path: string, currentName: string) => {
    setRenamingPath(path);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const finishRename = () => {
    if (renamingPath && renameValue && onFileRename) {
      const newPath = renamingPath.substring(0, renamingPath.lastIndexOf('/') + 1) + renameValue;
      onFileRename(renamingPath, newPath);
    }
    setRenamingPath(null);
  };

  const getFileIcon = (filename: string) => {
    return <File size={16} className="text-zinc-400" />;
  };

  const renderNode = (node: FileNode, depth = 0, hideRoot = true) => {
    if (hideRoot && node.name === 'root') {
      return node.children?.map(child => renderNode(child, depth, false)) || null;
    }

    if (node.type === 'folder') {
      const isExpanded = expanded[node.path];
      return (
        <div key={node.path}>
          <div
            onClick={(e) => toggleFolder(node.path, e)}
            onContextMenu={(e) => handleContextMenu(e, node.path, 'folder')}
            className="flex items-center gap-1 px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer rounded group"
          >
            {isExpanded ? (
              <ChevronDown size={16} className="text-zinc-500" />
            ) : (
              <ChevronRight size={16} className="text-zinc-500" />
            )}
            <Folder size={16} className="text-blue-400" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate flex-1">
              {node.name}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              {onFileCreate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const filename = prompt('New file name:');
                    if (filename) onFileCreate(`${node.path}${filename}`);
                  }}
                  className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                  title="New file"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, depth + 1, false))}
            </div>
          )}
        </div>
      );
    }

    // File node
    return (
      <div key={node.path}>
        {renamingPath === node.path ? (
          <div className="flex items-center gap-1 px-2 py-1.5">
            {getFileIcon(node.name)}
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishRename();
                if (e.key === 'Escape') setRenamingPath(null);
              }}
              onBlur={finishRename}
              className="flex-1 px-1 py-0 text-sm bg-white dark:bg-zinc-700 border border-blue-500 rounded dark:text-white"
            />
          </div>
        ) : (
          <div
            onClick={() => onFileSelect(node.path)}
            onContextMenu={(e) => handleContextMenu(e, node.path, 'file')}
            className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded cursor-pointer text-sm group ${
              activeFile === node.path
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileIcon(node.name)}
              <span className="truncate text-sm">{node.name}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(node.path, node.name);
                }}
                className="p-0.5 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded"
                title="Rename"
              >
                <Edit2 size={12} className="text-yellow-600 dark:text-yellow-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(node.path);
                }}
                className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                title="Delete"
              >
                <Trash2 size={12} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-2">
        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Files</div>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* File Tree or Search Results */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredFiles ? (
          // Search Results
          <div className="space-y-1">
            {filteredFiles.length > 0 ? (
              filteredFiles.map(result => (
                <div
                  key={result.path}
                  onClick={() => {
                    onFileSelect(result.path);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                    activeFile === result.path
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {getFileIcon(result.name)}
                  <span className="truncate text-sm">{result.name}</span>
                  <span className="text-xs opacity-50 truncate flex-1 text-right">{result.path}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p className="text-sm">No files found</p>
              </div>
            )}
          </div>
        ) : (
          // File Tree
          renderNode(fileTree)
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <button
            onClick={() => {
              onFileSelect(contextMenu.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-900 dark:text-white flex items-center gap-2"
          >
            <Eye size={14} />
            Open
          </button>
          {contextMenu.type === 'file' && (
            <>
              <button
                onClick={() => startRename(contextMenu.path, contextMenu.path.split('/').pop() || '')}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-900 dark:text-white flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-700"
              >
                <Edit2 size={14} />
                Rename
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(contextMenu.path);
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-900 dark:text-white flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-700"
              >
                <Copy size={14} />
                Copy Path
              </button>
            </>
          )}
          <button
            onClick={() => {
              onFileDelete(contextMenu.path);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-sm text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-700"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
