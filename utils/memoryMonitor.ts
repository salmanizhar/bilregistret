import { Platform, Alert } from 'react-native';
import { performStorageMaintenance } from './storage';
import { performCacheCleanup } from '@/Services/api/utils/cacheManager';

interface MemoryStats {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
    timestamp: number;
}

class MemoryMonitor {
    private memoryHistory: MemoryStats[] = [];
    private maxHistorySize = 20;
    private warningThreshold = 0.8; // 80% of heap limit
    private criticalThreshold = 0.9; // 90% of heap limit
    private lastCleanupTime = 0;
    private cleanupCooldown = 30000; // 30 seconds between cleanups
    private isMonitoring = false;
    private monitoringInterval?: NodeJS.Timeout;

    startMonitoring(intervalMs: number = 10000) {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, intervalMs);

        // console.log('Memory monitoring started');
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.isMonitoring = false;
        // console.log('Memory monitoring stopped');
    }

    private getMemoryStats(): MemoryStats {
        const stats: MemoryStats = {
            timestamp: Date.now()
        };

        // Web/Chrome DevTools memory API
        if (Platform.OS === 'web' && (performance as any).memory) {
            const memory = (performance as any).memory;
            stats.jsHeapSizeLimit = memory.jsHeapSizeLimit;
            stats.totalJSHeapSize = memory.totalJSHeapSize;
            stats.usedJSHeapSize = memory.usedJSHeapSize;
        }

        return stats;
    }

    private checkMemoryUsage() {
        const stats = this.getMemoryStats();
        this.addToHistory(stats);

        if (stats.usedJSHeapSize && stats.jsHeapSizeLimit) {
            const usageRatio = stats.usedJSHeapSize / stats.jsHeapSizeLimit;

            if (usageRatio > this.criticalThreshold) {
                this.handleCriticalMemoryUsage(usageRatio);
            } else if (usageRatio > this.warningThreshold) {
                this.handleWarningMemoryUsage(usageRatio);
            }
        }

        // Check for memory leaks (consistently increasing memory)
        this.checkForMemoryLeaks();
    }

    private addToHistory(stats: MemoryStats) {
        this.memoryHistory.push(stats);
        if (this.memoryHistory.length > this.maxHistorySize) {
            this.memoryHistory.shift();
        }
    }

    private handleWarningMemoryUsage(usageRatio: number) {
        const usagePercent = (usageRatio * 100).toFixed(1);
        console.warn(`Memory usage warning: ${usagePercent}%`);

        // Trigger preventive cleanup
        this.performPreventiveCleanup();
    }

    private handleCriticalMemoryUsage(usageRatio: number) {
        const usagePercent = (usageRatio * 100).toFixed(1);
        console.error(`Critical memory usage: ${usagePercent}%`);

        // Trigger aggressive cleanup
        this.performAggressiveCleanup();

        if (__DEV__) {
            Alert.alert(
                'Memory Warning',
                `High memory usage detected: ${usagePercent}%\nPerforming cleanup...`,
                [{ text: 'OK' }]
            );
        }
    }

    private checkForMemoryLeaks() {
        if (this.memoryHistory.length < 5) return;

        const recent = this.memoryHistory.slice(-5);
        const increasing = recent.every((stats, index) => {
            if (index === 0) return true;
            const prev = recent[index - 1];
            return stats.usedJSHeapSize && prev.usedJSHeapSize &&
                stats.usedJSHeapSize > prev.usedJSHeapSize;
        });

        if (increasing) {
            console.warn('Potential memory leak detected - memory consistently increasing');
            this.performPreventiveCleanup();
        }
    }

    private async performPreventiveCleanup() {
        const now = Date.now();
        if (now - this.lastCleanupTime < this.cleanupCooldown) return;

        this.lastCleanupTime = now;
        // console.log('Performing preventive memory cleanup...');

        try {
            // Clear image cache
            const { Image } = require('expo-image');
            Image.clearMemoryCache();

            // Cleanup React Query cache
            await performCacheCleanup({
                maxAge: 10 * 60 * 1000, // 10 minutes
                maxSize: 30,
            });

            // Storage maintenance
            await performStorageMaintenance();

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            // console.log('Preventive cleanup completed');
        } catch (error) {
            console.warn('Error during preventive cleanup:', error);
        }
    }

    private async performAggressiveCleanup() {
        // console.log('Performing aggressive memory cleanup...');

        try {
            // Clear all image caches
            const { Image } = require('expo-image');
            Image.clearMemoryCache();
            Image.clearDiskCache();

            // Aggressive cache cleanup
            await performCacheCleanup({
                maxAge: 5 * 60 * 1000, // 5 minutes
                maxSize: 10,
                clearPersisted: true,
            });

            // Clear storage
            await performStorageMaintenance();

            // Force garbage collection multiple times
            if (global.gc) {
                for (let i = 0; i < 3; i++) {
                    global.gc();
                }
            }

            // console.log('Aggressive cleanup completed');
        } catch (error) {
            console.warn('Error during aggressive cleanup:', error);
        }
    }

    getMemoryReport(): string {
        const latest = this.memoryHistory[this.memoryHistory.length - 1];
        if (!latest) return 'No memory data available';

        let report = `Memory Report (${new Date(latest.timestamp).toLocaleTimeString()}):\n`;

        if (latest.usedJSHeapSize && latest.jsHeapSizeLimit) {
            const usedMB = (latest.usedJSHeapSize / 1024 / 1024).toFixed(2);
            const limitMB = (latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
            const usagePercent = ((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(1);

            report += `Used: ${usedMB}MB / ${limitMB}MB (${usagePercent}%)\n`;
        }

        if (this.memoryHistory.length > 1) {
            const first = this.memoryHistory[0];
            const trend = latest.usedJSHeapSize && first.usedJSHeapSize
                ? latest.usedJSHeapSize - first.usedJSHeapSize
                : 0;
            const trendMB = (trend / 1024 / 1024).toFixed(2);
            report += `Trend: ${trend > 0 ? '+' : ''}${trendMB}MB over ${this.memoryHistory.length} samples`;
        }

        return report;
    }

    // Manual cleanup trigger
    async forceCleanup(aggressive: boolean = false) {
        if (aggressive) {
            await this.performAggressiveCleanup();
        } else {
            await this.performPreventiveCleanup();
        }
    }

    // Reset monitoring data
    reset() {
        this.memoryHistory = [];
        this.lastCleanupTime = 0;
    }
}

// Singleton instance
export const memoryMonitor = new MemoryMonitor();

// Convenience functions
export const startMemoryMonitoring = (intervalMs?: number) => {
    memoryMonitor.startMonitoring(intervalMs);
};

export const stopMemoryMonitoring = () => {
    memoryMonitor.stopMonitoring();
};

export const getMemoryReport = () => {
    return memoryMonitor.getMemoryReport();
};

export const forceMemoryCleanup = (aggressive?: boolean) => {
    return memoryMonitor.forceCleanup(aggressive);
};