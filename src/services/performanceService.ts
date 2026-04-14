import React from 'react';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  category: 'rendering' | 'api' | 'parse' | 'compile' | 'memory';
  details?: Record<string, any>;
}

export interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetric[];
  averageRenderTime: number;
  peakMemoryUsage: number;
  totalExecutionTime: number;
}

/**
 * Utility functions for performance optimization
 */
export class OptimizationUtils {
  /**
   * Debounce a function - wait until function stops being called before executing
   * Useful for: input changes, window resize, search queries
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function debounced(...args: Parameters<T>) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, wait);
    };
  }

  /**
   * Throttle a function - execute at most once every wait milliseconds
   * Useful for: scroll events, mouse move, resize
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let lastRun = Date.now();

    return function throttled(...args: Parameters<T>) {
      const now = Date.now();
      if (now - lastRun >= wait) {
        func(...args);
        lastRun = now;
      }
    };
  }

  /**
   * Request idle callback with fallback
   */
  static requestIdleCallback(callback: () => void, options?: IdleRequestOptions): number {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      return window.requestIdleCallback(callback, options);
    }
    // Fallback for browsers that don't support requestIdleCallback
    return window.setTimeout(callback, 1) as unknown as number;
  }

  /**
   * Cancel idle callback with fallback
   */
  static cancelIdleCallback(id: number): void {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      window.clearTimeout(id);
    }
  }
}

export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private maxMetricsStored = 1000;

  startMeasure(name: string): void {
    this.marks.set(name, performance.now());
  }

  endMeasure(
    name: string,
    category: PerformanceMetric['category'],
    details?: Record<string, any>
  ): PerformanceMetric {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`[Performance] No mark found for: ${name}`);
      return {
        name,
        duration: 0,
        timestamp: Date.now(),
        category,
        details,
      };
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      category,
      details,
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics = this.metrics.slice(-this.maxMetricsStored);
    }

    return metric;
  }

  recordMetric(
    name: string,
    duration: number,
    category: PerformanceMetric['category'],
    details?: Record<string, any>
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      category,
      details,
    };

    this.metrics.push(metric);
    return metric;
  }

  getMetrics(filter?: { category?: string; name?: string }): PerformanceMetric[] {
    if (!filter) return this.metrics;

    return this.metrics.filter(m => {
      if (filter.category && m.category !== filter.category) return false;
      if (filter.name && m.name !== filter.name) return false;
      return true;
    });
  }

  getMetricsReport(): PerformanceReport {
    const renderMetrics = this.metrics.filter(m => m.category === 'rendering');
    const averageRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
        : 0;

    const peakMemoryUsage = performance.memory?.usedJSHeapSize || 0;
    const totalExecutionTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      timestamp: Date.now(),
      metrics: this.metrics,
      averageRenderTime,
      peakMemoryUsage,
      totalExecutionTime,
    };
  }

  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  getSlowMetrics(threshold: number = 100): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  getMetricStats(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const stats: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};

    this.metrics.forEach(metric => {
      if (!stats[metric.name]) {
        stats[metric.name] = {
          count: 0,
          avgDuration: 0,
          maxDuration: 0,
        };
      }

      const stat = stats[metric.name];
      stat.count++;
      stat.avgDuration = (stat.avgDuration * (stat.count - 1) + metric.duration) / stat.count;
      stat.maxDuration = Math.max(stat.maxDuration, metric.duration);
    });

    return stats;
  }

  exportMetrics(): string {
    const report = this.getMetricsReport();
    return JSON.stringify(report, null, 2);
  }

  analyzeBottlenecks(): string {
    const slowMetrics = this.getSlowMetrics();
    const stats = this.getMetricStats();

    let analysis = '=== Performance Analysis ===\n\n';
    
    analysis += 'Bottlenecks (>100ms):\n';
    slowMetrics.forEach(metric => {
      analysis += `- ${metric.name}: ${metric.duration.toFixed(2)}ms\n`;
    });

    analysis += '\n\nTop 5 Slowest Operations:\n';
    Object.entries(stats)
      .sort((a, b) => b[1].maxDuration - a[1].maxDuration)
      .slice(0, 5)
      .forEach(([name, stat]) => {
        analysis += `- ${name}: max=${stat.maxDuration.toFixed(2)}ms, avg=${stat.avgDuration.toFixed(2)}ms\n`;
      });

    analysis += `\nTotal metrics recorded: ${this.metrics.length}\n`;
    analysis += `Total execution time: ${this.getMetricsReport().totalExecutionTime.toFixed(2)}ms\n`;

    return analysis;
  }
}

export const createPerformanceService = (): PerformanceService => {
  return new PerformanceService();
};

// Helper hook for React components
export function usePerformanceMonitor(name: string, performanceService: PerformanceService) {
  React.useEffect(() => {
    performanceService.startMeasure(name);

    return () => {
      performanceService.endMeasure(name, 'rendering');
    };
  }, []);
}
