import React, { useState } from 'react';
import { Settings, X, Plus, Download, Upload } from 'lucide-react';
import { ThemeService, ThemeConfig } from '../services/themeService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  themeService: ThemeService;
  onThemeChange: (theme: ThemeConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  themeService,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'editor' | 'performance'>('theme');
  const currentTheme = themeService.getCurrentTheme();
  const [customColors, setCustomColors] = useState(currentTheme.colors);

  const handleColorChange = (key: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
    themeService.updateThemeColors({ [key]: value });
    onThemeChange(themeService.getCurrentTheme());
  };

  const handleThemeSelect = (name: string) => {
    themeService.setTheme(name);
    setCustomColors(themeService.getCurrentTheme().colors);
    onThemeChange(themeService.getCurrentTheme());
  };

  const exportTheme = () => {
    const theme = themeService.exportTheme();
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${currentTheme.name}-${Date.now()}.json`;
    link.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string) as ThemeConfig;
          themeService.importTheme(config);
          setCustomColors(config.colors);
          onThemeChange(config);
        } catch (error) {
          console.error('Error importing theme:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-zinc-900 dark:text-white" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            <X size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['theme', 'editor', 'performance'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'theme' && (
            <>
              {/* Preset Themes */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  Preset Themes
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {themeService.getAvailableThemes().map(name => (
                    <button
                      key={name}
                      onClick={() => handleThemeSelect(name)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        currentTheme.name.toLowerCase() === name.toLowerCase()
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  Custom Colors
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(customColors).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) =>
                            handleColorChange(key as keyof typeof customColors, e.target.value)
                          }
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleColorChange(key as keyof typeof customColors, e.target.value)
                          }
                          className="flex-1 px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export/Import */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={exportTheme}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload size={16} />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTheme}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-white block mb-1">
                  Font Size
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                  <option>12px</option>
                  <option selected>14px</option>
                  <option>16px</option>
                  <option>18px</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-white block mb-1">
                  Tab Size
                </label>
                <select className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white">
                  <option>2</option>
                  <option selected>4</option>
                  <option>8</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="wordwrap" defaultChecked />
                <label htmlFor="wordwrap" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Word Wrap
                </label>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Performance optimization settings will be available here.
              </p>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="autoformat" defaultChecked />
                <label htmlFor="autoformat" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Auto-format on save
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="linting" defaultChecked />
                <label htmlFor="linting" className="text-sm text-zinc-700 dark:text-zinc-300">
                  Enable linting
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
