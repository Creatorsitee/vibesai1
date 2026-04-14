import React, { useState } from 'react';
import { Share2, Copy, LinkIcon, Users, Lock, Globe, Download, QrCode } from 'lucide-react';

interface CollaborationPanelProps {
  projectName: string;
  projectId: string;
}

type ShareMode = 'private' | 'link' | 'public';

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectName,
  projectId,
}) => {
  const [shareMode, setShareMode] = useState<ShareMode>('private');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShareLink = () => {
    const link = `${window.location.origin}?share=${projectId}&mode=${shareMode}`;
    setShareLink(link);
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadProject = () => {
    const projectData = {
      name: projectName,
      id: projectId,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-export.json`;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white overflow-auto">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Share2 size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold">Kolaborasi & Berbagi</h1>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Bagikan proyek Anda dengan tim atau publik
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-2xl">
          {/* Share Mode Selection */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Mode Berbagi</h2>
            <div className="space-y-3">
              {/* Private */}
              <button
                onClick={() => setShareMode('private')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  shareMode === 'private'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Lock size={20} className={shareMode === 'private' ? 'text-blue-600' : 'text-zinc-400'} />
                  <div>
                    <p className="font-semibold">Pribadi</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Hanya Anda yang dapat mengakses</p>
                  </div>
                </div>
              </button>

              {/* Link Sharing */}
              <button
                onClick={() => setShareMode('link')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  shareMode === 'link'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <LinkIcon size={20} className={shareMode === 'link' ? 'text-blue-600' : 'text-zinc-400'} />
                  <div>
                    <p className="font-semibold">Berbagi Link</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Siapa saja dengan tautan dapat mengakses</p>
                  </div>
                </div>
              </button>

              {/* Public */}
              <button
                onClick={() => setShareMode('public')}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  shareMode === 'public'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Globe size={20} className={shareMode === 'public' ? 'text-blue-600' : 'text-zinc-400'} />
                  <div>
                    <p className="font-semibold">Publik</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Terlihat di galeri publik</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Share Link */}
          {shareMode !== 'private' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Tautan Berbagi</h2>
              <div className="space-y-3">
                <button
                  onClick={generateShareLink}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Buat Tautan Berbagi
                </button>

                {shareLink && (
                  <div className="space-y-2">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg break-all text-sm font-mono text-zinc-600 dark:text-zinc-400">
                      {shareLink}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Copy size={16} />
                      {copied ? 'Disalin!' : 'Salin Tautan'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Ekspor Proyek</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Unduh proyek Anda sebagai file JSON untuk disimpan atau dibagikan
            </p>
            <button
              onClick={downloadProject}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Unduh Proyek
            </button>
          </div>

          {/* Team Members */}
          {shareMode !== 'private' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Anggota Tim
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Belum ada anggota tim yang ditambahkan
              </p>
              <button className="w-full px-4 py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors">
                + Tambah Anggota
              </button>
            </div>
          )}

          {/* Permissions */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Izin</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="w-4 h-4" />
                <span className="text-sm">Lihat Kode</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer">
                <input type="checkbox" disabled className="w-4 h-4" />
                <span className="text-sm">Edit Kode</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer">
                <input type="checkbox" disabled className="w-4 h-4" />
                <span className="text-sm">Hapus Proyek</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
