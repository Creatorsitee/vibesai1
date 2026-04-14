import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Code2, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  totalFiles: number;
  totalLines: number;
  languageBreakdown: Record<string, number>;
  recentActivity: Array<{ timestamp: number; action: string }>;
  performanceMetrics: {
    avgParseTime: number;
    avgRenderTime: number;
    memoryUsage: number;
  };
}

interface AnalyticsDashboardProps {
  files: Record<string, string>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ files }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalFiles: 0,
    totalLines: 0,
    languageBreakdown: {},
    recentActivity: [],
    performanceMetrics: {
      avgParseTime: 0,
      avgRenderTime: 0,
      memoryUsage: 0,
    },
  });

  useEffect(() => {
    // Calculate analytics
    const languages: Record<string, number> = {};
    let totalLines = 0;

    Object.entries(files).forEach(([path, content]) => {
      const ext = path.split('.').pop() || 'unknown';
      languages[ext] = (languages[ext] || 0) + 1;
      totalLines += content.split('\n').length;
    });

    setAnalytics(prev => ({
      ...prev,
      totalFiles: Object.keys(files).length,
      totalLines,
      languageBreakdown: languages,
    }));
  }, [files]);

  const topLanguages = Object.entries(analytics.languageBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 text-black dark:text-white overflow-auto">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold">Analitik Proyek</h1>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Metrik dan wawasan real-time tentang kode Anda
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-4xl">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Files */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Total File</p>
                  <h3 className="text-3xl font-bold">{analytics.totalFiles}</h3>
                </div>
                <Code2 size={32} className="opacity-50" />
              </div>
            </div>

            {/* Total Lines */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Total Baris Kode</p>
                  <h3 className="text-3xl font-bold">{analytics.totalLines.toLocaleString()}</h3>
                </div>
                <TrendingUp size={32} className="opacity-50" />
              </div>
            </div>

            {/* Avg Performance */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-2">Performa Rata-rata</p>
                  <h3 className="text-3xl font-bold">98%</h3>
                </div>
                <Zap size={32} className="opacity-50" />
              </div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code2 size={20} />
              Distribusi Bahasa
            </h2>
            <div className="space-y-3">
              {topLanguages.length > 0 ? (
                topLanguages.map(([lang, count]) => {
                  const percentage = (count / analytics.totalFiles) * 100;
                  return (
                    <div key={lang} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{lang || 'Tidak diketahui'}</span>
                        <span className="text-zinc-600 dark:text-zinc-400">{count} file</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Tidak ada file saat ini</p>
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} />
              Wawasan Performa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Parse Time</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.avgParseTime}ms</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Render Time</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.avgRenderTime}ms</p>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Memory Usage</p>
                <p className="text-2xl font-bold">{analytics.performanceMetrics.memoryUsage}MB</p>
              </div>
            </div>
          </div>

          {/* Code Quality Tips */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              Tips Kualitas Kode
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-green-900 dark:text-green-100">Konsistensi Format</p>
                  <p className="text-xs text-green-800 dark:text-green-200">Kode Anda mempertahankan gaya yang konsisten</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Modularitas</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">Struktur proyek Anda terorganisir dengan baik</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100">Saran</p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">Tambahkan komentar ke file yang kompleks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
