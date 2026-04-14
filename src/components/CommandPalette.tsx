import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  category: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          // Open palette
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search Input */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 p-3 flex items-center gap-2">
          <Search size={20} className="text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands..."
            className="flex-1 bg-transparent outline-none text-lg dark:text-white"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, cmds]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900/50">
                {category}
              </div>

              {/* Commands */}
              {cmds.map((cmd, index) => {
                const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors ${
                      selectedIndex === globalIndex
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {cmd.icon && <span className="shrink-0">{cmd.icon}</span>}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs opacity-75 truncate">{cmd.description}</div>
                        )}
                      </div>
                    </div>
                    {cmd.shortcut && (
                      <span className="text-xs opacity-50 whitespace-nowrap">{cmd.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              <p>No commands found</p>
              <p className="text-sm mt-1">Try a different search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 flex justify-between">
          <span>{filteredCommands.length} results</span>
          <span>↵ to select • ↑↓ to navigate • ESC to close</span>
        </div>
      </div>
    </div>
  );
};
