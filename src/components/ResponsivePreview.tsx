import React, { useRef, useState } from 'react';
import { RefreshCw, Smartphone, Tablet, Monitor, Maximize2, Minimize2 } from 'lucide-react';

interface ResponsivePreviewProps {
  files: Record<string, string>;
  theme: 'light' | 'dark';
}

type DevicePreset = 'mobile' | 'tablet' | 'desktop' | 'fullscreen';

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const DEVICE_PRESETS: Record<DevicePreset, DeviceConfig> = {
  mobile: {
    name: 'iPhone 14',
    width: 390,
    height: 844,
    icon: <Smartphone size={16} />,
  },
  tablet: {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    icon: <Tablet size={16} />,
  },
  desktop: {
    name: 'Desktop',
    width: 1920,
    height: 1080,
    icon: <Monitor size={16} />,
  },
  fullscreen: {
    name: 'Full Screen',
    width: 100,
    height: 100,
    icon: <Maximize2 size={16} />,
  },
};

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  files,
  theme,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentPreset, setCurrentPreset] = useState<DevicePreset>('desktop');
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState<string | null>(null);

  const config = DEVICE_PRESETS[currentPreset];
  const isFullscreen = currentPreset === 'fullscreen';
  const width = isFullscreen ? '100%' : `${config.width}px`;
  const height = isFullscreen ? '100%' : `${config.height}px`;

  const refreshPreview = () => {
    const htmlFile = Object.keys(files).find(f => f.endsWith('.html')) || 'index.html';
    const htmlContent = files[htmlFile];

    if (!htmlContent) {
      setError('No HTML file found. Create an index.html file to preview.');
      return;
    }

    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const wrappedContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; }
            html, body { height: 100%; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.previewState = {
              zoom: ${zoom},
              device: '${currentPreset}'
            };
            
            // Apply zoom
            document.body.style.zoom = ${zoom}%;
          </script>
          ${htmlContent}
        </body>
        </html>
      `;

      const blob = new Blob([wrappedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      setError(null);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  React.useEffect(() => {
    refreshPreview();
  }, [files, zoom, currentPreset]);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-zinc-950 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Toolbar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Device Presets */}
          <div className="flex items-center gap-2">
            {(Object.entries(DEVICE_PRESETS) as Array<[DevicePreset, DeviceConfig]>).map(
              ([preset, cfg]) => (
                <button
                  key={preset}
                  onClick={() => setCurrentPreset(preset)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    currentPreset === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                  }`}
                  title={cfg.name}
                >
                  {cfg.icon}
                  <span className="hidden sm:inline">{cfg.name}</span>
                </button>
              )
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-sm dark:text-white"
            >
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
              <option value="125">125%</option>
              <option value="150">150%</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={refreshPreview}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw size={18} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-4">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <p className="text-red-900 dark:text-red-100 text-sm">{error}</p>
          </div>
        ) : (
          <div
            className={`bg-white dark:bg-zinc-950 shadow-lg transition-all ${
              isFullscreen ? 'w-full h-full' : 'rounded-lg border border-zinc-200 dark:border-zinc-800'
            }`}
            style={{
              width,
              height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              title={`Preview - ${config.name}`}
            />
          </div>
        )}
      </div>

      {/* Info Footer */}
      {!error && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            {config.name} • {isFullscreen ? 'Full Screen' : `${config.width}×${config.height}`}px • Zoom: {zoom}%
          </span>
        </div>
      )}
    </div>
  );
};
