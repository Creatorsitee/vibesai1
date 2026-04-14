import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { EditorState } from '../hooks/useEditorState';

interface EditorSettingsPanelProps {
  settings: EditorState;
  onSettingsChange: (updates: Partial<EditorState>) => void;
  onClose: () => void;
}

export const EditorSettingsPanel: React.FC<EditorSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const resetToDefaults = () => {
    onSettingsChange({
      fontSize: 14,
      lineNumbers: true,
      wordWrap: true,
      minimap: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Editor Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings */}
        <div className="p-4 space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ fontSize: parseInt(e.target.value) })}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">Display</h3>

            {/* Line Numbers */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lineNumbers}
                onChange={(e) => onSettingsChange({ lineNumbers: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Line Numbers</span>
            </label>

            {/* Word Wrap */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => onSettingsChange({ wordWrap: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Word Wrap</span>
            </label>

            {/* Minimap */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.minimap}
                onChange={(e) => onSettingsChange({ minimap: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 cursor-pointer"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Minimap</span>
            </label>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => onSettingsChange({ theme: t as 'light' | 'dark' })}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    settings.theme === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetToDefaults}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm font-medium text-zinc-900 dark:text-white"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
